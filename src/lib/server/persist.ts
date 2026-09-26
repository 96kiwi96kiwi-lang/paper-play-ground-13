/**
 * Server-side persistent bot state.
 * LocalStorage is UI-only; this file store survives process restarts.
 * Never write API keys here.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { RiskState } from "@/lib/risk";
import type { PortfolioSnapshot } from "@/lib/orders/order-manager";
import type { UnifiedOrder } from "@/lib/exchange/types";
import type { GridBook } from "@/lib/strategies";
import type { TradingRuntimeMode } from "./trading-mode";

export type PersistedHeartbeat = {
  at: number;
  symbol?: string;
  action?: string;
  hardStopped?: boolean;
};

export type PersistedBotState = {
  version: 1;
  savedAt: number;
  mode: TradingRuntimeMode;
  liveConfirmedAt: number | null;
  risk: Pick<
    RiskState,
    | "portfolioValue"
    | "cash"
    | "openPositionsCount"
    | "dailyPnlPct"
    | "drawdownPct"
    | "losingStreak"
    | "cooldownUntil"
    | "haltReason"
    | "networkErrorStreak"
    | "lastPrices"
    | "tradesToday"
    | "tradesDayKey"
  > | null;
  lastHardStop: { at: number; reason: string } | null;
  lastHeartbeat: PersistedHeartbeat | null;
  /** Paper portfolio only. Live balances always come from the exchange. */
  paperPortfolio: PortfolioSnapshot | null;
  /** Recent orders keyed by clientOrderId for idempotent replay after restart. */
  seenOrders: UnifiedOrder[];
  /** Grid mid + last-fill so a restart does not re-buy the same rung. */
  gridBooks: Record<string, GridBook>;
  /** Last accepted submit timestamp — burst guard must survive restart. */
  lastSubmitAt: number;
};

const STATE_PATH = resolve(process.cwd(), "data", "bot-state.json");
const MAX_SEEN_ORDERS = 200;

function emptyState(): PersistedBotState {
  return {
    version: 1,
    savedAt: 0,
    mode: "paper",
    liveConfirmedAt: null,
    risk: null,
    lastHardStop: null,
    lastHeartbeat: null,
    paperPortfolio: null,
    seenOrders: [],
    gridBooks: {},
    lastSubmitAt: 0,
  };
}

export function loadBotState(): PersistedBotState {
  try {
    if (!existsSync(STATE_PATH)) return emptyState();
    const raw = JSON.parse(readFileSync(STATE_PATH, "utf8")) as Partial<PersistedBotState>;
    return {
      ...emptyState(),
      ...raw,
      version: 1,
      mode: raw.mode === "live" ? "paper" : (raw.mode ?? "paper"),
      // Always boot in paper. Live must be re-confirmed after restart.
      liveConfirmedAt: null,
      paperPortfolio: sanitizePortfolio(raw.paperPortfolio),
      seenOrders: sanitizeSeenOrders(raw.seenOrders),
      lastHeartbeat: sanitizeHeartbeat(raw.lastHeartbeat),
      gridBooks: sanitizeGridBooks(raw.gridBooks),
      lastSubmitAt: sanitizeLastSubmitAt(raw.lastSubmitAt),
    };
  } catch (err) {
    console.warn("[persist] failed to load bot-state.json", err);
    return emptyState();
  }
}

function sanitizeLastSubmitAt(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n;
}

function sanitizeHeartbeat(raw: unknown): PersistedHeartbeat | null {
  if (!raw || typeof raw !== "object") return null;
  const at = Number((raw as PersistedHeartbeat).at);
  if (!Number.isFinite(at) || at <= 0) return null;
  const symbol = (raw as PersistedHeartbeat).symbol;
  const action = (raw as PersistedHeartbeat).action;
  return {
    at,
    symbol: typeof symbol === "string" ? symbol : undefined,
    action: typeof action === "string" ? action : undefined,
    hardStopped: Boolean((raw as PersistedHeartbeat).hardStopped),
  };
}

function sanitizePortfolio(raw: unknown): PortfolioSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const cash = Number((raw as PortfolioSnapshot).cash);
  if (!Number.isFinite(cash)) return null;
  const positions: PortfolioSnapshot["positions"] = {};
  const src = (raw as PortfolioSnapshot).positions;
  if (src && typeof src === "object") {
    for (const [symbol, pos] of Object.entries(src)) {
      if (!pos) continue;
      const amount = Number(pos.amount);
      const avgEntry = Number(pos.avgEntry);
      if (!Number.isFinite(amount) || amount <= 0) continue;
      positions[symbol] = {
        amount,
        avgEntry: Number.isFinite(avgEntry) ? avgEntry : 0,
      };
    }
  }
  return { cash: Math.max(0, cash), positions };
}

function sanitizeSeenOrders(raw: unknown): UnifiedOrder[] {
  if (!Array.isArray(raw)) return [];
  const out: UnifiedOrder[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Partial<UnifiedOrder>;
    if (!o.id || !o.symbol || (o.side !== "buy" && o.side !== "sell")) continue;
    out.push({
      id: String(o.id),
      clientOrderId: o.clientOrderId ? String(o.clientOrderId) : undefined,
      symbol: String(o.symbol),
      side: o.side,
      type: o.type === "limit" ? "limit" : "market",
      amount: Number(o.amount) || 0,
      price: o.price != null ? Number(o.price) : undefined,
      status: String(o.status ?? "closed"),
      filled: Number(o.filled) || 0,
      remaining: o.remaining != null ? Number(o.remaining) : undefined,
      cost: Number(o.cost) || 0,
      timestamp: Number(o.timestamp) || 0,
      rejectReason: o.rejectReason ? String(o.rejectReason) : undefined,
    });
  }
  return out.slice(-MAX_SEEN_ORDERS);
}

function sanitizeGridBooks(raw: unknown): Record<string, GridBook> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, GridBook> = {};
  for (const [symbol, book] of Object.entries(raw as Record<string, GridBook>)) {
    if (!symbol || !book || typeof book !== "object") continue;
    const mid = Number(book.mid);
    const spacingPct = Number(book.spacingPct);
    const builtAt = Number(book.builtAt);
    if (!Number.isFinite(mid) || mid <= 0) continue;
    if (!Number.isFinite(spacingPct) || spacingPct <= 0) continue;
    const lastSide = book.lastSide === "buy" || book.lastSide === "sell" ? book.lastSide : undefined;
    const lastLevelNum = book.lastLevel != null ? Number(book.lastLevel) : undefined;
    const lastFillPriceNum = book.lastFillPrice != null ? Number(book.lastFillPrice) : undefined;
    const lastFillAtNum = book.lastFillAt != null ? Number(book.lastFillAt) : undefined;
    out[symbol] = {
      mid,
      spacingPct,
      builtAt: Number.isFinite(builtAt) && builtAt > 0 ? builtAt : Date.now(),
      lastSide,
      lastLevel: lastLevelNum != null && Number.isFinite(lastLevelNum) ? lastLevelNum : undefined,
      lastFillPrice:
        lastFillPriceNum != null && Number.isFinite(lastFillPriceNum) && lastFillPriceNum > 0
          ? lastFillPriceNum
          : undefined,
      lastFillAt:
        lastFillAtNum != null && Number.isFinite(lastFillAtNum) && lastFillAtNum > 0
          ? lastFillAtNum
          : undefined,
    };
  }
  return out;
}

export function saveBotState(patch: Partial<PersistedBotState>): PersistedBotState {
  const current = loadBotState();
  const next: PersistedBotState = {
    ...current,
    ...patch,
    version: 1,
    savedAt: Date.now(),
  };
  if (next.seenOrders && next.seenOrders.length > MAX_SEEN_ORDERS) {
    next.seenOrders = next.seenOrders.slice(-MAX_SEEN_ORDERS);
  }
  try {
    mkdirSync(dirname(STATE_PATH), { recursive: true });
    writeFileSync(STATE_PATH, JSON.stringify(next, null, 2), "utf8");
  } catch (err) {
    console.error("[persist] failed to write bot-state.json", err);
  }
  return next;
}

export function persistRiskSnapshot(risk: RiskState): void {
  saveBotState({
    risk: {
      portfolioValue: risk.portfolioValue,
      cash: risk.cash,
      openPositionsCount: risk.openPositionsCount,
      dailyPnlPct: risk.dailyPnlPct,
      drawdownPct: risk.drawdownPct,
      losingStreak: risk.losingStreak,
      cooldownUntil: risk.cooldownUntil,
      haltReason: risk.haltReason,
      networkErrorStreak: risk.networkErrorStreak,
      lastPrices: risk.lastPrices,
      tradesToday: risk.tradesToday ?? 0,
      tradesDayKey: risk.tradesDayKey,
    },
    lastHardStop: risk.haltReason
      ? { at: Date.now(), reason: risk.haltReason }
      : loadBotState().lastHardStop,
  });
}

export function persistPaperPortfolio(portfolio: PortfolioSnapshot): void {
  saveBotState({
    paperPortfolio: {
      cash: portfolio.cash,
      positions: { ...portfolio.positions },
    },
  });
}

export function loadPaperPortfolio(): PortfolioSnapshot | null {
  return loadBotState().paperPortfolio;
}

export function persistSeenOrders(orders: UnifiedOrder[]): void {
  saveBotState({ seenOrders: orders.slice(-MAX_SEEN_ORDERS) });
}

export function loadSeenOrders(): UnifiedOrder[] {
  return loadBotState().seenOrders;
}

export function persistGridBooks(books: Record<string, GridBook>): void {
  saveBotState({ gridBooks: sanitizeGridBooks(books) });
}

export function loadGridBooks(): Record<string, GridBook> {
  return loadBotState().gridBooks;
}

export function persistLastSubmitAt(at: number): void {
  const n = Number(at);
  saveBotState({ lastSubmitAt: Number.isFinite(n) && n > 0 ? n : 0 });
}

export function loadLastSubmitAt(): number {
  return loadBotState().lastSubmitAt ?? 0;
}
