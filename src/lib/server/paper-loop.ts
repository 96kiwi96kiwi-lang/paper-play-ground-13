/** Persistent paper-only market → strategy → order loop. */

import { TRADING_CONFIG } from "@/config/trading";
import { executeBotTick } from "@/lib/bot-engine";
import { PaperExchange } from "@/lib/exchange/paper";
import type { OrderManager } from "@/lib/orders/order-manager";
import { recordNetworkOutcome, type RiskState } from "@/lib/risk";
import { expireStaleGridReservations, snapshotGridBooks } from "@/lib/strategies";
import { createServerOrderManager } from "./create-order-manager";
import { recordBotHeartbeat } from "./heartbeat";
import {
  appendMarketHistory,
  fetchCoinGeckoMarketSnapshot,
  type MarketQuoteSource,
} from "./market-quotes";
import {
  loadBotState,
  loadMarketHistory,
  loadPaperPortfolio,
  persistGridBooks,
  persistMarketHistory,
  persistRiskSnapshot,
} from "./persist";
import { claimWorkerLease, restorePersistedGridBooks } from "./register-monitoring";
import { cancelStaleSeenOrdersOnDisk } from "./stale-seen";
import { getRuntimeMode } from "./trading-mode";

export type PaperLoopStatus = {
  enabled: boolean;
  running: boolean;
  mode: "paper" | "live";
  lastTickAt: number | null;
  lastTickAgeMs: number | null;
  ticks: number;
  reason: string;
  lastStaleCanceled?: number;
  lastQuoteAt?: number | null;
  lastDecisions?: number;
  lastOrders?: number;
};

let timer: ReturnType<typeof setTimeout> | null = null;
let ticks = 0;
let lastTickAt: number | null = null;
let lastQuoteAt: number | null = null;
let lastReason = "idle";
let lastStaleCanceled = 0;
let lastDecisions = 0;
let lastOrders = 0;
let quoteSource: MarketQuoteSource = fetchCoinGeckoMarketSnapshot;
let manager: OrderManager | null = null;
let paper: PaperExchange | null = null;
let history = loadMarketHistory();

export function paperServerLoopRequested(): boolean {
  const raw = process.env.PAPER_SERVER_LOOP?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

export function describePaperLoop(now = Date.now()): PaperLoopStatus {
  return {
    enabled: paperServerLoopRequested(),
    running: timer != null,
    mode: getRuntimeMode(),
    lastTickAt,
    lastTickAgeMs: lastTickAt != null ? Math.max(0, now - lastTickAt) : null,
    ticks,
    reason: lastReason,
    lastStaleCanceled,
    lastQuoteAt,
    lastDecisions,
    lastOrders,
  };
}

function ensureRuntime(): { manager: OrderManager; paper: PaperExchange } {
  if (manager && paper) return { manager, paper };
  const portfolio = loadPaperPortfolio();
  paper = new PaperExchange(
    portfolio?.cash ?? TRADING_CONFIG.paperStartingBalance,
    portfolio?.positions ?? {},
  );
  manager = createServerOrderManager(paper);
  return { manager, paper };
}

function buildRiskState(orderManager: OrderManager, prices: Record<string, number>): RiskState {
  const saved = loadBotState().risk;
  const portfolio = orderManager.snapshot();
  const positionsValue = Object.entries(portfolio.positions).reduce(
    (sum, [symbol, position]) => sum + position.amount * (prices[symbol] ?? position.avgEntry),
    0,
  );
  return {
    portfolioValue: portfolio.cash + positionsValue,
    cash: portfolio.cash,
    openPositionsCount: Object.keys(portfolio.positions).length,
    dailyPnlPct: saved?.dailyPnlPct ?? 0,
    drawdownPct: saved?.drawdownPct ?? 0,
    losingStreak: saved?.losingStreak ?? 0,
    cooldownUntil: saved?.cooldownUntil ?? null,
    haltReason: saved?.haltReason ?? null,
    networkErrorStreak: saved?.networkErrorStreak ?? 0,
    lastPrices: saved?.lastPrices ?? {},
    tradesToday: saved?.tradesToday ?? 0,
    tradesDayKey: saved?.tradesDayKey,
  };
}

export function runPaperHousekeepingTick(now = Date.now()): PaperLoopStatus {
  restorePersistedGridBooks();
  expireStaleGridReservations();
  persistGridBooks(snapshotGridBooks());
  const sweep = cancelStaleSeenOrdersOnDisk(now);
  lastStaleCanceled = sweep.canceled;
  recordBotHeartbeat({ at: now, action: "hold", symbol: "loop" });
  ticks += 1;
  lastTickAt = now;
  lastReason = sweep.canceled > 0
    ? `housekeeping canceled ${sweep.canceled} stale working order(s)`
    : "housekeeping";
  return describePaperLoop(now);
}

/** One server-owned market tick. It is impossible to enter this path in live mode. */
export async function runPaperMarketTick(now = Date.now()): Promise<PaperLoopStatus> {
  if (getRuntimeMode() !== "paper") {
    lastReason = "refused: runtime mode is not paper";
    return describePaperLoop(now);
  }
  const claim = claimWorkerLease();
  if (!claim.ok) {
    lastReason = `standby: ${claim.reason ?? "lease held"}`;
    return describePaperLoop(now);
  }

  runPaperHousekeepingTick(now);
  const runtime = ensureRuntime();
  let risk: RiskState | null = null;
  try {
    const snapshot = await quoteSource(now);
    const prices = Object.fromEntries(
      Object.entries(snapshot.tickers).map(([symbol, ticker]) => [symbol, ticker.last]),
    );
    risk = buildRiskState(runtime.manager, prices);
    runtime.paper.setTickers(snapshot.tickers);
    history = appendMarketHistory(history, snapshot);
    persistMarketHistory(history);
    lastQuoteAt = Math.max(...Object.values(snapshot.tickers).map((ticker) => ticker.timestamp));

    let decisions = 0;
    let orders = 0;
    for (const symbol of TRADING_CONFIG.pairs) {
      const ticker = snapshot.tickers[symbol];
      if (!ticker) continue;
      const portfolio = runtime.manager.snapshot();
      const result = await executeBotTick(
        {
          strategy: TRADING_CONFIG.defaultStrategy,
          symbol,
          history: history[symbol] ?? [],
          currentPrice: ticker.last,
          hasPosition: runtime.manager.positionAmount(symbol) > 0,
          positionAvgEntry: portfolio.positions[symbol]?.avgEntry,
          riskState: risk,
        },
        runtime.manager,
      );
      decisions += 1;
      if (result.submit?.ok) orders += 1;
      recordBotHeartbeat({ at: now, action: result.tick.action, symbol, hardStopped: result.tick.hardStopped });
      console.info(
        `[paper-loop] tick symbol=${symbol} price=${ticker.last} action=${result.tick.action}` +
          ` execute=${result.tick.shouldExecute} submit=${result.submit?.ok ?? false}` +
          ` reason=${result.submit?.reason ?? result.tick.reason}`,
      );
    }
    lastDecisions = decisions;
    lastOrders = orders;
    recordNetworkOutcome(risk, null);
    persistRiskSnapshot(risk);
    lastReason = `market tick: ${decisions} decision(s), ${orders} accepted order(s)`;
  } catch (error) {
    const state = risk ?? buildRiskState(runtime.manager, {});
    recordNetworkOutcome(state, error);
    persistRiskSnapshot(state);
    const message = error instanceof Error ? error.message : String(error);
    lastReason = `market tick failed: ${message}`;
    console.warn(`[paper-loop] ${lastReason}`);
  }
  return describePaperLoop(now);
}

function scheduleNextTick(): void {
  timer = setTimeout(async () => {
    timer = null;
    if (getRuntimeMode() !== "paper" || !paperServerLoopRequested()) {
      stopPaperServerLoop("stopped: paper loop disabled or mode changed");
      return;
    }
    await runPaperMarketTick();
    if (getRuntimeMode() === "paper" && paperServerLoopRequested()) scheduleNextTick();
  }, TRADING_CONFIG.botTickMs);
}

function scheduleInitialTick(): void {
  timer = setTimeout(async () => {
    timer = null;
    await runPaperMarketTick();
    if (getRuntimeMode() === "paper" && paperServerLoopRequested()) scheduleNextTick();
  }, 0);
}

export function startPaperServerLoop(): PaperLoopStatus {
  if (getRuntimeMode() !== "paper") {
    lastReason = "refused: runtime mode is not paper";
    return describePaperLoop();
  }
  if (!paperServerLoopRequested()) {
    lastReason = "disabled (set PAPER_SERVER_LOOP=1)";
    return describePaperLoop();
  }
  const claim = claimWorkerLease();
  if (!claim.ok) {
    lastReason = `standby: ${claim.reason ?? "lease held"}`;
    return describePaperLoop();
  }
  if (timer) {
    lastReason = "already running";
    return describePaperLoop();
  }
  scheduleInitialTick();
  lastReason = "starting market loop";
  return describePaperLoop();
}

export function stopPaperServerLoop(reason = "stopped"): PaperLoopStatus {
  if (timer) clearTimeout(timer);
  timer = null;
  lastReason = reason;
  return describePaperLoop();
}

export function setPaperQuoteSourceForTests(source: MarketQuoteSource | null): void {
  quoteSource = source ?? fetchCoinGeckoMarketSnapshot;
}

export function resetPaperMarketRuntimeForTests(): void {
  manager = null;
  paper = null;
  history = loadMarketHistory();
  lastQuoteAt = null;
  lastDecisions = 0;
  lastOrders = 0;
}
