/**
 * Server-side trading API
 * -----------------------
 * Safe to call from server functions / loaders.
 * Never exposes API keys to the client.
 */

import { TRADING_CONFIG } from "@/config/trading";
import * as kucoin from "@/lib/exchange/kucoin";
import { utcDayKey } from "@/lib/risk";
import { snapshotGridBooks, type GridBook } from "@/lib/strategies";
import { assertLiveAllowed, getRuntimeMode, type TradingRuntimeMode } from "./trading-mode";
import {
  loadBotState,
  loadPaperPortfolio,
  persistPaperPortfolio,
  loadSeenOrders,
  persistSeenOrders,
  persistGridBooks,
  clearPersistedHalt,
  loadRecentAlerts,
  loadLastReject,
  type PersistedAlert,
  type PersistedHardStop,
} from "./persist";
import { checkStaleHeartbeat, recordBotHeartbeat, type BotHeartbeat } from "./heartbeat";
import { restorePersistedGridBooks } from "./register-monitoring";
import type { PortfolioSnapshot } from "@/lib/orders/order-manager";
import type { UnifiedOrder } from "@/lib/exchange/types";

export type Mode = TradingRuntimeMode;

export type HealthGridBook = {
  symbol: string;
  mid: number;
  spacingPct: number;
  lastSide?: GridBook["lastSide"];
  lastLevel?: number;
  lastFillPrice?: number;
  lastFillAt?: number;
  lastFillAgeMs: number | null;
  stackedBuys: number;
  reserved: boolean;
  bookAgeMs: number | null;
  reservationRemainingMs: number;
  reservationTtlMs: number;
};

export type HealthPaperPosition = {
  symbol: string;
  amount: number;
  avgEntry: number;
  costUsd: number;
};

export type HealthPaperBook = {
  cash: number;
  used: number;
  total: number;
  positionCount: number;
  positions: HealthPaperPosition[];
};

export type HealthDailyCap = {
  used: number;
  max: number;
  remaining: number;
  dayKey: string;
  exhausted: boolean;
};

export type HealthOrderWatch = {
  lastSubmitAt: number;
  lastSubmitAgeMs: number | null;
  seenOrderCount: number;
  workingOrderCount: number;
  minSubmitIntervalMs: number;
  burstCooldownMs: number;
  burstReady: boolean;
  maxConcurrentOpenOrders: number;
  maxOpenOrdersPerSymbol: number;
  workingSlotsLeft: number;
  workingAtCap: boolean;
};

export type HealthRiskWatch = {
  dailyPnlPct: number;
  drawdownPct: number;
  losingStreak: number;
  networkErrorStreak: number;
  cooldownUntil: number | null;
  cooldownRemainingMs: number;
  openPositionsCount: number;
  savedAt: number;
  stateAgeMs: number | null;
};

export type HealthExposureWatch = {
  usedUsd: number;
  maxGrossUsd: number;
  remainingUsd: number;
  usedPct: number;
  nearLimit: boolean;
  atLimit: boolean;
  maxOrderNotionalUsd: number;
  minOrderNotionalUsd: number;
  pairs: string[];
};

export type HealthLastReject = {
  at: number;
  reason: string;
  symbol?: string;
  side?: string;
  ageMs: number | null;
};

export interface HealthResponse {
  ok: boolean;
  mode: Mode;
  message: string;
  hasCredentials: boolean;
  heartbeat?: BotHeartbeat | null;
  heartbeatAgeMs?: number | null;
  heartbeatStale?: boolean;
  lastHardStop?: PersistedHardStop | null;
  haltReason?: string | null;
  recentAlerts?: PersistedAlert[];
  gridBooks?: HealthGridBook[];
  paperBook?: HealthPaperBook | null;
  dailyCap?: HealthDailyCap;
  orderWatch?: HealthOrderWatch;
  riskWatch?: HealthRiskWatch | null;
  exposureWatch?: HealthExposureWatch;
  lastReject?: HealthLastReject | null;
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

export function getMode(): Mode {
  return getRuntimeMode();
}

export function markBotTick(partial: { symbol?: string; action?: string; hardStopped?: boolean }): void {
  restorePersistedGridBooks();
  recordBotHeartbeat(partial);
  persistGridBooks(snapshotGridBooks());
}

function dailyCapFields(now = Date.now()): HealthDailyCap {
  const state = loadBotState();
  const today = utcDayKey(now);
  const sameDay = state.risk?.tradesDayKey === today;
  const used = sameDay ? Math.max(0, Math.floor(Number(state.risk?.tradesToday) || 0)) : 0;
  const max = TRADING_CONFIG.risk.maxDailyTrades;
  return { used, max, remaining: Math.max(0, max - used), dayKey: today, exhausted: used >= max };
}

function isWorkingStatus(status: string): boolean {
  return status === "open" || status === "partially_filled" || status === "pending";
}

function orderWatchFields(now = Date.now()): HealthOrderWatch {
  const state = loadBotState();
  const lastSubmitAt = Number(state.lastSubmitAt) || 0;
  const seen = Array.isArray(state.seenOrders) ? state.seenOrders : [];
  const workingOrderCount = seen.filter((o) => isWorkingStatus(String(o.status))).length;
  const minSubmitIntervalMs = TRADING_CONFIG.orders.minSubmitIntervalMs;
  const elapsed = lastSubmitAt > 0 ? Math.max(0, now - lastSubmitAt) : minSubmitIntervalMs;
  const burstCooldownMs = lastSubmitAt > 0 ? Math.max(0, minSubmitIntervalMs - elapsed) : 0;
  const maxConcurrentOpenOrders = TRADING_CONFIG.orders.maxConcurrentOpenOrders;
  const maxOpenOrdersPerSymbol = TRADING_CONFIG.orders.maxOpenOrdersPerSymbol;
  const workingSlotsLeft = Math.max(0, maxConcurrentOpenOrders - workingOrderCount);
  return {
    lastSubmitAt,
    lastSubmitAgeMs: lastSubmitAt > 0 ? Math.max(0, now - lastSubmitAt) : null,
    seenOrderCount: seen.length,
    workingOrderCount,
    minSubmitIntervalMs,
    burstCooldownMs,
    burstReady: burstCooldownMs === 0,
    maxConcurrentOpenOrders,
    maxOpenOrdersPerSymbol,
    workingSlotsLeft,
    workingAtCap: workingSlotsLeft === 0,
  };
}

function paperBookFields(): HealthPaperBook | null {
  const stored = loadPaperPortfolio();
  if (!stored) return null;
  const positions: HealthPaperPosition[] = Object.entries(stored.positions)
    .filter(([, pos]) => pos && Number(pos.amount) > 0)
    .map(([symbol, pos]) => {
      const amount = Number(pos.amount) || 0;
      const avgEntry = Number(pos.avgEntry) || 0;
      return { symbol, amount, avgEntry, costUsd: amount * avgEntry };
    })
    .sort((a, b) => b.costUsd - a.costUsd);
  const used = positions.reduce((sum, pos) => sum + pos.costUsd, 0);
  return { cash: stored.cash, used, total: stored.cash + used, positionCount: positions.length, positions };
}

function exposureWatchFields(): HealthExposureWatch {
  const paper = paperBookFields();
  const usedUsd = paper ? Math.max(0, paper.used) : 0;
  const maxGrossUsd = TRADING_CONFIG.orders.maxGrossExposureUsd;
  const remainingUsd = Math.max(0, maxGrossUsd - usedUsd);
  const usedPct = maxGrossUsd > 0 ? (usedUsd / maxGrossUsd) * 100 : 0;
  return {
    usedUsd,
    maxGrossUsd,
    remainingUsd,
    usedPct,
    nearLimit: usedPct >= 80,
    atLimit: remainingUsd <= 0,
    maxOrderNotionalUsd: TRADING_CONFIG.orders.maxOrderNotionalUsd,
    minOrderNotionalUsd: TRADING_CONFIG.orders.minOrderNotionalUsd,
    pairs: [...TRADING_CONFIG.pairs],
  };
}

function riskWatchFields(now = Date.now()): HealthRiskWatch | null {
  const state = loadBotState();
  const risk = state.risk;
  if (!risk && !state.savedAt) return null;
  const cooldownUntil = risk?.cooldownUntil ?? null;
  const cooldownRemainingMs = cooldownUntil != null && cooldownUntil > now ? cooldownUntil - now : 0;
  return {
    dailyPnlPct: Number(risk?.dailyPnlPct) || 0,
    drawdownPct: Number(risk?.drawdownPct) || 0,
    losingStreak: Math.max(0, Math.floor(Number(risk?.losingStreak) || 0)),
    networkErrorStreak: Math.max(0, Math.floor(Number(risk?.networkErrorStreak) || 0)),
    cooldownUntil,
    cooldownRemainingMs,
    openPositionsCount: Math.max(0, Math.floor(Number(risk?.openPositionsCount) || 0)),
    savedAt: state.savedAt || 0,
    stateAgeMs: state.savedAt > 0 ? Math.max(0, now - state.savedAt) : null,
  };
}

function lastRejectFields(now = Date.now()): HealthLastReject | null {
  const raw = loadLastReject();
  if (!raw) return null;
  return {
    at: raw.at,
    reason: raw.reason,
    symbol: raw.symbol,
    side: raw.side,
    ageMs: raw.at > 0 ? Math.max(0, now - raw.at) : null,
  };
}

function haltFields(): Pick<HealthResponse, "lastHardStop" | "haltReason" | "recentAlerts"> {
  const state = loadBotState();
  const cleared = Boolean(state.lastHardStop?.clearedAt) && !state.risk?.haltReason;
  return {
    lastHardStop: state.lastHardStop,
    haltReason: cleared ? null : state.risk?.haltReason ?? state.lastHardStop?.reason ?? null,
    recentAlerts: loadRecentAlerts().slice(-10),
  };
}

function gridFields(now = Date.now()): HealthGridBook[] {
  restorePersistedGridBooks();
  const books = snapshotGridBooks();
  const reservationTtlMs = TRADING_CONFIG.grid.reservationTtlMs;
  return Object.entries(books).map(([symbol, book]) => {
    const lastFillAgeMs = book.lastFillAt && book.lastFillAt > 0 ? Math.max(0, now - book.lastFillAt) : null;
    const reserved = Boolean(book.reserved);
    const reservationRemainingMs = reserved && lastFillAgeMs != null ? Math.max(0, reservationTtlMs - lastFillAgeMs) : 0;
    return {
      symbol,
      mid: book.mid,
      spacingPct: book.spacingPct,
      lastSide: book.lastSide,
      lastLevel: book.lastLevel,
      lastFillPrice: book.lastFillPrice,
      lastFillAt: book.lastFillAt,
      lastFillAgeMs,
      stackedBuys: book.stackedBuys ?? 0,
      reserved,
      bookAgeMs: book.builtAt && book.builtAt > 0 ? Math.max(0, now - book.builtAt) : null,
      reservationRemainingMs,
      reservationTtlMs,
    };
  });
}

export function clearOperatorHalt(note?: string): {
  ok: true;
  haltReason: string | null;
  lastHardStop: PersistedHardStop | null;
} {
  const state = clearPersistedHalt(note);
  const cleared = Boolean(state.lastHardStop?.clearedAt) && !state.risk?.haltReason;
  return {
    ok: true,
    haltReason: cleared ? null : state.risk?.haltReason ?? null,
    lastHardStop: state.lastHardStop,
  };
}

function baseHealthFields(now = Date.now()) {
  return {
    ...haltFields(),
    gridBooks: gridFields(now),
    paperBook: paperBookFields(),
    dailyCap: dailyCapFields(now),
    orderWatch: orderWatchFields(now),
    riskWatch: riskWatchFields(now),
    exposureWatch: exposureWatchFields(),
    lastReject: lastRejectFields(now),
  };
}

export async function getHealth(): Promise<HealthResponse> {
  restorePersistedGridBooks();
  const mode = getMode();
  const watch = await checkStaleHeartbeat();
  const extra = baseHealthFields();
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
      ...extra,
    };
  }
  const health = await kucoin.healthCheck();
  return {
    ok: health.ok && !watch.stale,
    mode: "live",
    message: watch.stale ? `LIVE heartbeat stale (${Math.round((watch.ageMs ?? 0) / 1000)}s)` : health.message,
    hasCredentials: kucoin.hasCredentials(),
    heartbeat: watch.heartbeat,
    heartbeatAgeMs: watch.ageMs,
    heartbeatStale: watch.stale,
    ...extra,
  };
}

export async function getBalance(paperCash?: number): Promise<BalanceResponse> {
  const mode = getMode();
  if (mode === "paper") {
    const stored = loadPaperPortfolio();
    const cash = stored?.cash ?? paperCash ?? TRADING_CONFIG.paperStartingBalance;
    const used = stored ? Object.values(stored.positions).reduce((sum, p) => sum + p.amount * p.avgEntry, 0) : 0;
    return { mode: "paper", free: cash, used, total: cash + used, source: "paper", positions: stored?.positions ?? {} };
  }
  const bal = await kucoin.fetchBalance();
  return { mode: "live", free: bal.free, used: bal.used, total: bal.total, source: "kucoin" };
}

export function recordPaperPortfolio(portfolio: PortfolioSnapshot): void {
  persistPaperPortfolio(portfolio);
}

export function recordSeenOrders(orders: UnifiedOrder[]): void {
  persistSeenOrders(orders);
}

export function getSeenOrders(): UnifiedOrder[] {
  return loadSeenOrders();
}

export async function getTickers(): Promise<TickersResponse> {
  const mode = getMode();
  if (mode === "paper") {
    return { mode: "paper", tickers: {}, source: "paper" };
  }
  const raw = await kucoin.fetchTickers();
  const tickers: TickersResponse["tickers"] = {};
  for (const [symbol, t] of Object.entries(raw)) {
    tickers[symbol] = { last: t.last, bid: t.bid, ask: t.ask, timestamp: t.timestamp };
  }
  return { mode: "live", tickers, source: "kucoin" };
}

export async function placeLiveMarketOrder(symbol: string, side: "buy" | "sell", amount: number) {
  assertLiveAllowed();
  return kucoin.placeMarketOrder(symbol, side, amount);
}

export async function cancelLiveOrder(orderId: string, symbol: string) {
  assertLiveAllowed();
  return kucoin.cancelOrder(orderId, symbol);
}

export async function cancelAllLiveOrders() {
  assertLiveAllowed();
  return kucoin.cancelAllOpenOrders();
}

export async function getOpenOrders(symbol?: string) {
  if (getMode() !== "live") return [];
  return kucoin.fetchOpenOrders(symbol);
}

export async function getLiveOrder(orderId: string, symbol: string) {
  if (getMode() !== "live") return null;
  return kucoin.fetchOrder(orderId, symbol);
}
