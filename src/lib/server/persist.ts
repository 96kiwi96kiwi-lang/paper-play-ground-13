/**
 * Server-side persistent bot state.
 * LocalStorage is UI-only; this file store survives process restarts.
 * Never write API keys here.
 */

import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
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

export type PersistedHardStop = {
  at: number;
  reason: string;
  code?: string;
  /** Set when an operator acknowledges the halt. History stays; halt does not restore. */
  clearedAt?: number;
  clearNote?: string;
};

/** Hard-stop alert ring (no secrets). Survives restart for the dashboard/health. */
export type PersistedAlert = {
  at: number;
  reason: string;
  code?: string;
  mode?: string;
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
  lastHardStop: PersistedHardStop | null;
  lastHeartbeat: PersistedHeartbeat | null;
  /** Paper portfolio only. Live balances always come from the exchange. */
  paperPortfolio: PortfolioSnapshot | null;
  /** Recent orders keyed by clientOrderId for idempotent replay after restart. */
  seenOrders: UnifiedOrder[];
  /** Grid mid + last-fill so a restart does not re-buy the same rung. */
  gridBooks: Record<string, GridBook>;
  /** Last accepted submit timestamp — burst guard must survive restart. */
  lastSubmitAt: number;
  /** Recent hard-stop alerts for monitoring history after restart. */
  recentAlerts: PersistedAlert[];
};

const STATE_PATH = resolve(process.cwd(), "data", "bot-state.json");
const STATE_TMP_PATH = `${STATE_PATH}.tmp`;
const MAX_SEEN_ORDERS = 200;
const MAX_ALERTS = 50;

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
    recentAlerts: [],
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
      lastHardStop: sanitizeHardStop(raw.lastHardStop),
      gridBooks: sanitizeGridBooks(raw.gridBooks),
      lastSubmitAt: sanitizeLastSubmitAt(raw.lastSubmitAt),
      recentAlerts: sanitizeAlerts(raw.recentAlerts),
    };
  } catch (err) {
    console.warn("[persist] failed to load bot-state.json", err);
    return emptyState();
  }
}

export function sanitizeAlerts(raw: unknown): PersistedAlert[] {
  if (!Array.isArray(raw)) return [];
  const out: PersistedAlert[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const a = item as PersistedAlert;
    const at = Number(a.at);
    if (!Number.isFinite(at) || at <= 0) continue;
    if (typeof a.reason !== "string" || !a.reason.trim()) continue;
    out.push({
      at,
      reason: a.reason.trim(),
      code: typeof a.code === "string" && a.code.trim() ? a.code.trim() : undefined,
      mode: typeof a.mode === "string" && a.mode.trim() ? a.mode.trim() : undefined,
    });
  }
  return out.slice(-MAX_ALERTS);
}

function sanitizeLastSubmitAt(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n;
}

export function sanitizeHardStop(raw: unknown): PersistedHardStop | null {
  if (!raw || typeof raw !== "object") return null;
  const at = Number((raw as PersistedHardStop).at);
  const reason = (raw as PersistedHardStop).reason;
  if (!Number.isFinite(at) || at <= 0) return null;
  if (typeof reason !== "string" || !reason.trim()) return null;
  const code = (raw as PersistedHardStop).code;
  const clearedAtRaw = Number((raw as PersistedHardStop).clearedAt);
  const clearNote = (raw as PersistedHardStop).clearNote;
  return {
    at,
    reason: reason.trim(),
    code: typeof code === "string" && code.trim() ? code.trim() : undefined,
    clearedAt: Number.isFinite(clearedAtRaw) && clearedAtRaw > 0 ? clearedAtRaw : undefined,
    clearNote: typeof clearNote === "string" && clearNote.trim() ? clearNote.trim() : undefined,
  };
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
    const stackedRaw = book.stackedBuys != null ? Number(book.stackedBuys) : 0;
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
      lastFillAt: lastFillAtNum != null && Number.isFinite(lastFillAtNum) && lastFillAtNum > 0 ? lastFillAtNum : undefined,
      stackedBuys: Number.isFinite(stackedRaw) && stackedRaw > 0 ? Math.floor(stackedRaw) : 0,
      reserved: Boolean(book.reserved),
    };
  }
  return out;
}

function inferHardStopCode(reason: string): string | undefined {
  const r = reason.toLowerCase();
  if (r.includes("daily loss")) return "daily_loss_limit";
  if (r.includes("drawdown")) return "max_drawdown";
  if (r.includes("losing streak")) return "losing_streak";
  if (r.includes("price gap")) return "price_gap";
  if (r.includes("network")) return "network_errors";
  if (r.includes("daily trade cap")) return "daily_trade_cap";
  return undefined;
}

function emptyRiskSlice(): NonNullable<PersistedBotState["risk"]> {
  return {
    portfolioValue: 0,
    cash: 0,
    openPositionsCount: 0,
    dailyPnlPct: 0,
    drawdownPct: 0,
    losingStreak: 0,
    cooldownUntil: null,
    haltReason: null,
    networkErrorStreak: 0,
    lastPrices: {},
    tradesToday: 0,
    tradesDayKey: undefined,
  };
}

/** Write via sibling .tmp + rename so a crash cannot leave a half-written JSON file. */
function writeStateAtomic(state: PersistedBotState): void {
  mkdirSync(dirname(STATE_PATH), { recursive: true });
  writeFileSync(STATE_TMP_PATH, JSON.stringify(state, null, 2), "utf8");
  try {
    renameSync(STATE_TMP_PATH, STATE_PATH);
  } catch (err) {
    try {
      unlinkSync(STATE_TMP_PATH);
    } catch {
      /* ignore leftover tmp */
    }
    throw err;
  }
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
  if (next.recentAlerts && next.recentAlerts.length > MAX_ALERTS) {
    next.recentAlerts = next.recentAlerts.slice(-MAX_ALERTS);
  }
  try {
    writeStateAtomic(next);
  } catch (err) {
    console.error("[persist] failed to write bot-state.json", err);
  }
  return next;
}

export function persistRiskSnapshot(risk: RiskState, code?: string): void {
  const existing = loadBotState().lastHardStop;
  const nextStop =
    risk.haltReason && (!existing || existing.reason !== risk.haltReason || existing.clearedAt)
      ? {
          at: Date.now(),
          reason: risk.haltReason,
          code: code ?? inferHardStopCode(risk.haltReason),
        }
      : existing;
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
    lastHardStop: nextStop,
  });
}

/** Record a halt even when the caller only has reason/code (no full RiskState). */
export function recordPersistedHardStop(reason: string, code?: string): void {
  const trimmed = reason.trim();
  if (!trimmed) return;
  const current = loadBotState();
  const existing = current.lastHardStop;
  const same = existing && existing.reason === trimmed && !existing.clearedAt;
  const nextStop: PersistedHardStop = same && existing
    ? existing
    : {
        at: Date.now(),
        reason: trimmed,
        code: code ?? existing?.code ?? inferHardStopCode(trimmed),
      };
  saveBotState({
    lastHardStop: nextStop,
    risk: {
      portfolioValue: current.risk?.portfolioValue ?? 0,
      cash: current.risk?.cash ?? 0,
      openPositionsCount: current.risk?.openPositionsCount ?? 0,
      dailyPnlPct: current.risk?.dailyPnlPct ?? 0,
      drawdownPct: current.risk?.drawdownPct ?? 0,
      losingStreak: current.risk?.losingStreak ?? 0,
      cooldownUntil: current.risk?.cooldownUntil ?? null,
      haltReason: trimmed,
      networkErrorStreak: current.risk?.networkErrorStreak ?? 0,
      lastPrices: current.risk?.lastPrices ?? {},
      tradesToday: current.risk?.tradesToday ?? 0,
      tradesDayKey: current.risk?.tradesDayKey,
    },
  });
}

/**
 * Operator clear: drop haltReason, zero count-streaks that would re-fire,
 * stamp lastHardStop.clearedAt so applyPersistedHalt will not restore the halt.
 * Daily PnL / drawdown are left as-is and can halt again if still breached.
 */
export function clearPersistedHalt(note?: string): PersistedBotState {
  const current = loadBotState();
  const existing = current.lastHardStop;
  const nextStop: PersistedHardStop | null = existing
    ? {
        ...existing,
        clearedAt: Date.now(),
        clearNote: note?.trim() || existing.clearNote,
      }
    : null;
  const risk = current.risk ? { ...current.risk } : emptyRiskSlice();
  risk.haltReason = null;
  risk.losingStreak = 0;
  risk.networkErrorStreak = 0;
  console.info(
    `[persist] operator cleared halt was=${existing?.reason ?? "none"} note=${note?.trim() || "-"}`,
  );
  return saveBotState({ lastHardStop: nextStop, risk });
}

export function loadHaltReason(): string | null {
  const state = loadBotState();
  if (state.lastHardStop?.clearedAt && !state.risk?.haltReason) return null;
  return state.risk?.haltReason ?? state.lastHardStop?.reason ?? null;
}

/**
 * Overlay disk halt + counters onto an in-memory RiskState.
 * A process restart must not resume trading after a hard-stop or reset the UTC trade cap.
 * A cleared halt (clearedAt set, haltReason null) must not come back from lastHardStop.reason.
 */
export function applyPersistedHalt(state: RiskState): RiskState {
  const saved = loadBotState();
  const haltCleared = Boolean(saved.lastHardStop?.clearedAt) && !saved.risk?.haltReason;
  const reason = haltCleared
    ? null
    : saved.risk?.haltReason ?? saved.lastHardStop?.reason ?? null;
  if (reason && !state.haltReason) {
    state.haltReason = reason;
  }
  const risk = saved.risk;
  if (!risk) return state;

  if (risk.tradesDayKey) state.tradesDayKey = risk.tradesDayKey;
  if (risk.tradesToday != null) state.tradesToday = risk.tradesToday;
  if (risk.losingStreak != null) {
    state.losingStreak = Math.max(state.losingStreak ?? 0, risk.losingStreak);
  }
  if (risk.networkErrorStreak != null) {
    state.networkErrorStreak = Math.max(state.networkErrorStreak ?? 0, risk.networkErrorStreak);
  }
  if (risk.cooldownUntil != null) {
    state.cooldownUntil = Math.max(state.cooldownUntil ?? 0, risk.cooldownUntil);
  }
  if (typeof risk.dailyPnlPct === "number") state.dailyPnlPct = risk.dailyPnlPct;
  if (typeof risk.drawdownPct === "number") state.drawdownPct = risk.drawdownPct;
  if (risk.lastPrices && Object.keys(risk.lastPrices).length) {
    state.lastPrices = { ...(state.lastPrices ?? {}), ...risk.lastPrices };
  }
  return state;
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

export function persistRecentAlerts(alerts: PersistedAlert[]): void {
  saveBotState({ recentAlerts: sanitizeAlerts(alerts) });
}

export function loadRecentAlerts(): PersistedAlert[] {
  return loadBotState().recentAlerts ?? [];
}
