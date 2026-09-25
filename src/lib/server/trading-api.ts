/**
 * Server-side trading API
 * -----------------------
 * Safe to call from server functions / loaders.
 * Never exposes API keys to the client.
 */

import { TRADING_CONFIG } from "@/config/trading";
import * as kucoin from "@/lib/exchange/kucoin";
import { assertLiveAllowed, getRuntimeMode, type TradingRuntimeMode } from "./trading-mode";
import {
  loadPaperPortfolio,
  persistPaperPortfolio,
  loadSeenOrders,
  persistSeenOrders,
} from "./persist";
import { checkStaleHeartbeat, recordBotHeartbeat, type BotHeartbeat } from "./heartbeat";
import type { PortfolioSnapshot } from "@/lib/orders/order-manager";
import type { UnifiedOrder } from "@/lib/exchange/types";

export type Mode = TradingRuntimeMode;

export interface HealthResponse {
  ok: boolean;
  mode: Mode;
  message: string;
  hasCredentials: boolean;
  heartbeat?: BotHeartbeat | null;
  heartbeatAgeMs?: number | null;
  heartbeatStale?: boolean;
}

export interface BalanceResponse {
  mode: Mode;
  free: number;
  used: number;
  total: number;
  source: "paper" | "kucoin";
  positions?: PortfolioSnapshot["positions"];
}

export interface TickersResponse {
  mode: Mode;
  tickers: Record<string, { last: number; bid: number; ask: number; timestamp: number }>;
  source: "paper" | "kucoin";
}

/** Current configured mode (runtime, default paper) */
export function getMode(): Mode {
  return getRuntimeMode();
}

/** Call after each bot tick so health can detect a dead loop. */
export function markBotTick(partial: { symbol?: string; action?: string; hardStopped?: boolean }): void {
  recordBotHeartbeat(partial);
}

/** Health check – safe for both modes */
export async function getHealth(): Promise<HealthResponse> {
  const mode = getMode();
  const watch = await checkStaleHeartbeat();

  if (mode === "paper") {
    return {
      ok: !watch.stale,
      mode: "paper",
      message: watch.stale
        ? `Paper mode – heartbeat stale (${Math.round((watch.ageMs ?? 0) / 1000)}s)`
        : "Paper mode active – no real money at risk",
      hasCredentials: kucoin.hasCredentials(),
      heartbeat: watch.heartbeat,
      heartbeatAgeMs: watch.ageMs,
      heartbeatStale: watch.stale,
    };
  }

  const health = await kucoin.healthCheck();
  return {
    ok: health.ok && !watch.stale,
    mode: "live",
    message: watch.stale
      ? `LIVE heartbeat stale (${Math.round((watch.ageMs ?? 0) / 1000)}s)`
      : health.message,
    hasCredentials: kucoin.hasCredentials(),
    heartbeat: watch.heartbeat,
    heartbeatAgeMs: watch.ageMs,
    heartbeatStale: watch.stale,
  };
}

/** Balance – paper returns persisted virtual cash when available; live hits KuCoin */
export async function getBalance(paperCash?: number): Promise<BalanceResponse> {
  const mode = getMode();

  if (mode === "paper") {
    const stored = loadPaperPortfolio();
    const cash = stored?.cash ?? paperCash ?? TRADING_CONFIG.paperStartingBalance;
    const used = stored
      ? Object.values(stored.positions).reduce((sum, p) => sum + p.amount * p.avgEntry, 0)
      : 0;
    return {
      mode: "paper",
      free: cash,
      used,
      total: cash + used,
      source: "paper",
      positions: stored?.positions ?? {},
    };
  }

  const bal = await kucoin.fetchBalance();
  return {
    mode: "live",
    free: bal.free,
    used: bal.used,
    total: bal.total,
    source: "kucoin",
  };
}

/** Persist a paper fill so a process restart does not reset virtual cash. */
export function recordPaperPortfolio(portfolio: PortfolioSnapshot): void {
  persistPaperPortfolio(portfolio);
}

/** Persist clientOrderId ledger so retries after restart stay idempotent. */
export function recordSeenOrders(orders: UnifiedOrder[]): void {
  persistSeenOrders(orders);
}

export function getSeenOrders(): UnifiedOrder[] {
  return loadSeenOrders();
}

/** Tickers from KuCoin when live, otherwise empty (client uses CoinGecko) */
export async function getTickers(): Promise<TickersResponse> {
  const mode = getMode();

  if (mode === "paper") {
    return {
      mode: "paper",
      tickers: {},
      source: "paper",
    };
  }

  const raw = await kucoin.fetchTickers();
  const tickers: TickersResponse["tickers"] = {};
  for (const [symbol, t] of Object.entries(raw)) {
    tickers[symbol] = {
      last: t.last,
      bid: t.bid,
      ask: t.ask,
      timestamp: t.timestamp,
    };
  }

  return {
    mode: "live",
    tickers,
    source: "kucoin",
  };
}

/** Place market order – only works when mode === "live" */
export async function placeLiveMarketOrder(
  symbol: string,
  side: "buy" | "sell",
  amount: number,
) {
  assertLiveAllowed();
  return kucoin.placeMarketOrder(symbol, side, amount);
}

/** Cancel order – live only */
export async function cancelLiveOrder(orderId: string, symbol: string) {
  assertLiveAllowed();
  return kucoin.cancelOrder(orderId, symbol);
}

/** Cancel every visible open order – live only */
export async function cancelAllLiveOrders() {
  assertLiveAllowed();
  return kucoin.cancelAllOpenOrders();
}

/** Open orders – live only */
export async function getOpenOrders(symbol?: string) {
  if (getMode() !== "live") {
    return [];
  }
  return kucoin.fetchOpenOrders(symbol);
}

/** Fetch a single live order by id. */
export async function getLiveOrder(orderId: string, symbol: string) {
  if (getMode() !== "live") return null;
  return kucoin.fetchOrder(orderId, symbol);
}
