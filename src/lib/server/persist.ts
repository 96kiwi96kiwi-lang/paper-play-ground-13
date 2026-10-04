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
import type { PersistedLastReject } from "./last-reject";
import type { PricePoint } from "@/lib/trading";
export type { PersistedLastReject } from "./last-reject";
export { persistLastReject, loadLastReject, sanitizeLastReject } from "./last-reject";

export type PersistedHeartbeat = { at: number; symbol?: string; action?: string; hardStopped?: boolean };
export type PersistedHardStop = { at: number; reason: string; code?: string; clearedAt?: number; clearNote?: string };
export type PersistedAlert = { at: number; reason: string; code?: string; mode?: string };
export type PersistedBotState = {
  version: 1;
  savedAt: number;
  mode: TradingRuntimeMode;
  liveConfirmedAt: number | null;
  risk: Pick<RiskState, "portfolioValue" | "cash" | "openPositionsCount" | "dailyPnlPct" | "drawdownPct" | "losingStreak" | "cooldownUntil" | "haltReason" | "networkErrorStreak" | "lastPrices" | "tradesToday" | "tradesDayKey"> | null;
  lastHardStop: PersistedHardStop | null;
  lastHeartbeat: PersistedHeartbeat | null;
  paperPortfolio: PortfolioSnapshot | null;
  seenOrders: UnifiedOrder[];
  gridBooks: Record<string, GridBook>;
  lastSubmitAt: number;
  lastReject?: PersistedLastReject | null;
  recentAlerts: PersistedAlert[];
  marketHistory: Record<string, PricePoint[]>;
};

let overrideStatePath: string | null = null;

function statePath(): string {
  return overrideStatePath ?? resolve(process.cwd(), "data", "bot-state.json");
}

/** Test-only: isolate persisted state in a temporary directory. */
export function setBotStatePathForTests(path: string | null): void {
  overrideStatePath = path;
}
const MAX_SEEN_ORDERS = 200;
const MAX_ALERTS = 50;

function emptyState(): PersistedBotState {
  return { version: 1, savedAt: 0, mode: "paper", liveConfirmedAt: null, risk: null, lastHardStop: null, lastHeartbeat: null, paperPortfolio: null, seenOrders: [], gridBooks: {}, lastSubmitAt: 0, lastReject: null, recentAlerts: [], marketHistory: {} };
}

function asNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function sanitizeAlerts(raw: unknown): PersistedAlert[] {
  if (!Array.isArray(raw)) return [];
  const out: PersistedAlert[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const a = item as PersistedAlert;
    const at = asNum(a.at);
    if (at <= 0 || typeof a.reason !== "string" || !a.reason.trim()) continue;
    out.push({ at, reason: a.reason.trim(), code: typeof a.code === "string" && a.code.trim() ? a.code.trim() : undefined, mode: typeof a.mode === "string" && a.mode.trim() ? a.mode.trim() : undefined });
  }
  return out.slice(-MAX_ALERTS);
}

function sanitizeLastSubmitAt(raw: unknown): number {
  const n = asNum(raw);
  return n > 0 ? n : 0;
}

export function sanitizeHardStop(raw: unknown): PersistedHardStop | null {
  if (!raw || typeof raw !== "object") return null;
  const hs = raw as PersistedHardStop;
  const at = asNum(hs.at);
  if (at <= 0 || typeof hs.reason !== "string" || !hs.reason.trim()) return null;
  const clearedAtRaw = asNum(hs.clearedAt);
  return { at, reason: hs.reason.trim(), code: typeof hs.code === "string" && hs.code.trim() ? hs.code.trim() : undefined, clearedAt: clearedAtRaw > 0 ? clearedAtRaw : undefined, clearNote: typeof hs.clearNote === "string" && hs.clearNote.trim() ? hs.clearNote.trim() : undefined };
}

function sanitizeHeartbeat(raw: unknown): PersistedHeartbeat | null {
  if (!raw || typeof raw !== "object") return null;
  const at = asNum((raw as PersistedHeartbeat).at);
  if (at <= 0) return null;
  const hb = raw as PersistedHeartbeat;
  return { at, symbol: typeof hb.symbol === "string" ? hb.symbol : undefined, action: typeof hb.action === "string" ? hb.action : undefined, hardStopped: Boolean(hb.hardStopped) };
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
      positions[symbol] = { amount, avgEntry: Number.isFinite(avgEntry) ? avgEntry : 0 };
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
    out.push({ id: String(o.id), clientOrderId: o.clientOrderId ? String(o.clientOrderId) : undefined, symbol: String(o.symbol), side: o.side, type: o.type === "limit" ? "limit" : "market", amount: Number(o.amount) || 0, price: o.price != null ? Number(o.price) : undefined, status: String(o.status ?? "closed"), filled: Number(o.filled) || 0, remaining: o.remaining != null ? Number(o.remaining) : undefined, cost: Number(o.cost) || 0, timestamp: Number(o.timestamp) || 0, rejectReason: o.rejectReason ? String(o.rejectReason) : undefined });
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
    if (!Number.isFinite(mid) || mid <= 0 || !Number.isFinite(spacingPct) || spacingPct <= 0) continue;
    const builtAt = Number(book.builtAt);
    const lastLevelNum = book.lastLevel != null ? Number(book.lastLevel) : undefined;
    const lastFillPriceNum = book.lastFillPrice != null ? Number(book.lastFillPrice) : undefined;
    const lastFillAtNum = book.lastFillAt != null ? Number(book.lastFillAt) : undefined;
    const stackedRaw = book.stackedBuys != null ? Number(book.stackedBuys) : 0;
    out[symbol] = {
      mid,
      spacingPct,
      builtAt: Number.isFinite(builtAt) && builtAt > 0 ? builtAt : Date.now(),
      lastSide: book.lastSide === "buy" || book.lastSide === "sell" ? book.lastSide : undefined,
      lastLevel: lastLevelNum != null && Number.isFinite(lastLevelNum) ? lastLevelNum : undefined,
      lastFillPrice: lastFillPriceNum != null && Number.isFinite(lastFillPriceNum) && lastFillPriceNum > 0 ? lastFillPriceNum : undefined,
      lastFillAt: lastFillAtNum != null && Number.isFinite(lastFillAtNum) && lastFillAtNum > 0 ? lastFillAtNum : undefined,
      stackedBuys: Number.isFinite(stackedRaw) && stackedRaw > 0 ? Math.floor(stackedRaw) : 0,
      reserved: Boolean(book.reserved),
    };
  }
  return out;
}

function sanitizeMarketHistory(raw: unknown): Record<string, PricePoint[]> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, PricePoint[]> = {};
  for (const [symbol, values] of Object.entries(raw as Record<string, unknown>)) {
    if (!symbol || !Array.isArray(values)) continue;
    out[symbol] = values
      .flatMap((value) => {
        if (!value || typeof value !== "object") return [];
        const t = Number((value as PricePoint).t);
        const price = Number((value as PricePoint).price);
        return t > 0 && price > 0 && Number.isFinite(t) && Number.isFinite(price)
          ? [{ t, price }]
          : [];
      })
      .sort((a, b) => a.t - b.t)
      .slice(-240);
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
  return { portfolioValue: 0, cash: 0, openPositionsCount: 0, dailyPnlPct: 0, drawdownPct: 0, losingStreak: 0, cooldownUntil: null, haltReason: null, networkErrorStreak: 0, lastPrices: {}, tradesToday: 0, tradesDayKey: undefined };
}

function writeStateAtomic(state: PersistedBotState): void {
  const path = statePath();
  const tmpPath = `${path}.tmp`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(tmpPath, JSON.stringify(state, null, 2), "utf8");
  try { renameSync(tmpPath, path); }
  catch (err) {
    try { unlinkSync(tmpPath); } catch { /* ignore */ }
    throw err;
  }
}

export function loadBotState(): PersistedBotState {
  try {
    const path = statePath();
    if (!existsSync(path)) return emptyState();
    const raw = JSON.parse(readFileSync(path, "utf8")) as Partial<PersistedBotState>;
    return {
      ...emptyState(),
      ...raw,
      version: 1,
      mode: raw.mode === "live" ? "paper" : (raw.mode ?? "paper"),
      liveConfirmedAt: null,
      paperPortfolio: sanitizePortfolio(raw.paperPortfolio),
      seenOrders: sanitizeSeenOrders(raw.seenOrders),
      lastHeartbeat: sanitizeHeartbeat(raw.lastHeartbeat),
      lastHardStop: sanitizeHardStop(raw.lastHardStop),
      gridBooks: sanitizeGridBooks(raw.gridBooks),
      lastSubmitAt: sanitizeLastSubmitAt(raw.lastSubmitAt),
      recentAlerts: sanitizeAlerts(raw.recentAlerts),
      marketHistory: sanitizeMarketHistory(raw.marketHistory),
    };
  } catch (err) {
    console.warn("[persist] failed to load bot-state.json", err);
    return emptyState();
  }
}

export function saveBotState(patch: Partial<PersistedBotState>): PersistedBotState {
  const current = loadBotState();
  const next: PersistedBotState = { ...current, ...patch, version: 1, savedAt: Date.now() };
  if (next.seenOrders && next.seenOrders.length > MAX_SEEN_ORDERS) next.seenOrders = next.seenOrders.slice(-MAX_SEEN_ORDERS);
  if (next.recentAlerts && next.recentAlerts.length > MAX_ALERTS) next.recentAlerts = next.recentAlerts.slice(-MAX_ALERTS);
  try { writeStateAtomic(next); } catch (err) { console.error("[persist] failed to write bot-state.json", err); }
  return next;
}

export function persistRiskSnapshot(risk: RiskState, code?: string): void {
  const existing = loadBotState().lastHardStop;
  const nextStop = risk.haltReason && (!existing || existing.reason !== risk.haltReason || existing.clearedAt)
    ? { at: Date.now(), reason: risk.haltReason, code: code ?? inferHardStopCode(risk.haltReason) }
    : existing;
  saveBotState({
    risk: { portfolioValue: risk.portfolioValue, cash: risk.cash, openPositionsCount: risk.openPositionsCount, dailyPnlPct: risk.dailyPnlPct, drawdownPct: risk.drawdownPct, losingStreak: risk.losingStreak, cooldownUntil: risk.cooldownUntil, haltReason: risk.haltReason, networkErrorStreak: risk.networkErrorStreak, lastPrices: risk.lastPrices, tradesToday: risk.tradesToday ?? 0, tradesDayKey: risk.tradesDayKey },
    lastHardStop: nextStop,
  });
}

export function recordPersistedHardStop(reason: string, code?: string): void {
  const trimmed = reason.trim();
  if (!trimmed) return;
  const current = loadBotState();
  const existing = current.lastHardStop;
  const same = existing && existing.reason === trimmed && !existing.clearedAt;
  const nextStop: PersistedHardStop = same && existing ? existing : { at: Date.now(), reason: trimmed, code: code ?? existing?.code ?? inferHardStopCode(trimmed) };
  const r = current.risk;
  saveBotState({
    lastHardStop: nextStop,
    risk: { portfolioValue: r?.portfolioValue ?? 0, cash: r?.cash ?? 0, openPositionsCount: r?.openPositionsCount ?? 0, dailyPnlPct: r?.dailyPnlPct ?? 0, drawdownPct: r?.drawdownPct ?? 0, losingStreak: r?.losingStreak ?? 0, cooldownUntil: r?.cooldownUntil ?? null, haltReason: trimmed, networkErrorStreak: r?.networkErrorStreak ?? 0, lastPrices: r?.lastPrices ?? {}, tradesToday: r?.tradesToday ?? 0, tradesDayKey: r?.tradesDayKey },
  });
}

export function clearPersistedHalt(note?: string): PersistedBotState {
  const current = loadBotState();
  const existing = current.lastHardStop;
  const nextStop: PersistedHardStop | null = existing ? { ...existing, clearedAt: Date.now(), clearNote: note?.trim() || existing.clearNote } : null;
  const risk = current.risk ? { ...current.risk } : emptyRiskSlice();
  risk.haltReason = null;
  risk.losingStreak = 0;
  risk.networkErrorStreak = 0;
  console.info(`[persist] operator cleared halt was=${existing?.reason ?? "none"} note=${note?.trim() || "-"}`);
  return saveBotState({ lastHardStop: nextStop, risk });
}

export function loadHaltReason(): string | null {
  const state = loadBotState();
  if (state.lastHardStop?.clearedAt && !state.risk?.haltReason) return null;
  return state.risk?.haltReason ?? state.lastHardStop?.reason ?? null;
}

export function applyPersistedHalt(state: RiskState): RiskState {
  const saved = loadBotState();
  const haltCleared = Boolean(saved.lastHardStop?.clearedAt) && !saved.risk?.haltReason;
  const reason = haltCleared ? null : saved.risk?.haltReason ?? saved.lastHardStop?.reason ?? null;
  if (reason && !state.haltReason) state.haltReason = reason;
  const risk = saved.risk;
  if (!risk) return state;
  if (risk.tradesDayKey) state.tradesDayKey = risk.tradesDayKey;
  if (risk.tradesToday != null) state.tradesToday = risk.tradesToday;
  if (risk.losingStreak != null) state.losingStreak = Math.max(state.losingStreak ?? 0, risk.losingStreak);
  if (risk.networkErrorStreak != null) state.networkErrorStreak = Math.max(state.networkErrorStreak ?? 0, risk.networkErrorStreak);
  if (risk.cooldownUntil != null) state.cooldownUntil = Math.max(state.cooldownUntil ?? 0, risk.cooldownUntil);
  if (typeof risk.dailyPnlPct === "number") state.dailyPnlPct = risk.dailyPnlPct;
  if (typeof risk.drawdownPct === "number") state.drawdownPct = risk.drawdownPct;
  if (risk.lastPrices && Object.keys(risk.lastPrices).length) state.lastPrices = { ...(state.lastPrices ?? {}), ...risk.lastPrices };
  return state;
}

export function persistPaperPortfolio(portfolio: PortfolioSnapshot): void {
  saveBotState({ paperPortfolio: { cash: portfolio.cash, positions: { ...portfolio.positions } } });
}
export function loadPaperPortfolio(): PortfolioSnapshot | null { return loadBotState().paperPortfolio; }
export function persistSeenOrders(orders: UnifiedOrder[]): void { saveBotState({ seenOrders: orders.slice(-MAX_SEEN_ORDERS) }); }
export function loadSeenOrders(): UnifiedOrder[] { return loadBotState().seenOrders; }
export function persistGridBooks(books: Record<string, GridBook>): void { saveBotState({ gridBooks: sanitizeGridBooks(books) }); }
export function loadGridBooks(): Record<string, GridBook> { return loadBotState().gridBooks; }
export function persistLastSubmitAt(at: number): void {
  const n = Number(at);
  saveBotState({ lastSubmitAt: Number.isFinite(n) && n > 0 ? n : 0 });
}
export function loadLastSubmitAt(): number { return loadBotState().lastSubmitAt ?? 0; }
export function persistRecentAlerts(alerts: PersistedAlert[]): void { saveBotState({ recentAlerts: sanitizeAlerts(alerts) }); }
export function loadRecentAlerts(): PersistedAlert[] { return loadBotState().recentAlerts ?? []; }
export function persistMarketHistory(history: Record<string, PricePoint[]>): void {
  saveBotState({ marketHistory: sanitizeMarketHistory(history) });
}
export function loadMarketHistory(): Record<string, PricePoint[]> {
  return loadBotState().marketHistory ?? {};
}
