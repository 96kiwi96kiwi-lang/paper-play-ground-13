/**
 * Strategy engine – mode agnostic
 * Works with any ExchangeAdapter (paper or kucoin).
 */

import { TRADING_CONFIG } from "@/config/trading";
import type { PricePoint } from "@/lib/trading";
import { pctChangeSince, avgSince, rsi } from "@/lib/trading";
import type { Side } from "@/lib/exchange/types";

export type StrategyId = "momentum" | "mean_reversion" | "rsi" | "grid";

export interface StrategySignal {
  action: Side | "hold";
  reason: string;
  confidence?: number;
}

export interface StrategyContext {
  symbol: string;
  history: PricePoint[];
  currentPrice: number;
  hasPosition: boolean;
  positionAvgEntry?: number;
}

export interface GridBook {
  mid: number;
  spacingPct: number;
  builtAt: number;
  lastSide?: Side;
  lastLevel?: number;
  lastFillPrice?: number;
  lastFillAt?: number;
  /** Count of unclosed grid buys on this symbol. */
  stackedBuys?: number;
  /** Last markFill is a reservation until the submit is accepted. */
  reserved?: boolean;
}

/** Momentum: buy on strong short-term rise, sell on drop */
export function momentumStrategy(ctx: StrategyContext): StrategySignal {
  const change5m = pctChangeSince(ctx.history, 5 * 60 * 1000);
  if (change5m === null) return { action: "hold", reason: "Insufficient history" };

  if (!ctx.hasPosition && change5m > 2.0) {
    return { action: "buy", reason: `Momentum +${change5m.toFixed(2)}% (5m)`, confidence: Math.min(change5m / 5, 1) };
  }
  if (ctx.hasPosition && change5m < -1.5) {
    return { action: "sell", reason: `Momentum ${change5m.toFixed(2)}% (5m)`, confidence: Math.min(Math.abs(change5m) / 4, 1) };
  }
  return { action: "hold", reason: `Momentum ${change5m.toFixed(2)}%` };
}

/** Mean reversion: buy when price is significantly below recent average */
export function meanReversionStrategy(ctx: StrategyContext): StrategySignal {
  const avg1h = avgSince(ctx.history, 60 * 60 * 1000);
  if (avg1h === null || avg1h <= 0) return { action: "hold", reason: "Insufficient history" };

  const deviation = ((ctx.currentPrice - avg1h) / avg1h) * 100;

  if (!ctx.hasPosition && deviation < -3.0) {
    return { action: "buy", reason: `Mean-rev ${deviation.toFixed(2)}% below 1h avg`, confidence: Math.min(Math.abs(deviation) / 6, 1) };
  }
  if (ctx.hasPosition && deviation > -0.5) {
    return { action: "sell", reason: `Mean-rev returned near average (${deviation.toFixed(2)}%)`, confidence: 0.7 };
  }
  return { action: "hold", reason: `Mean-rev ${deviation.toFixed(2)}%` };
}

/** Classic RSI */
export function rsiStrategy(ctx: StrategyContext): StrategySignal {
  const prices = ctx.history.map((p) => p.price);
  const value = rsi(prices, 14);
  if (value === null) return { action: "hold", reason: "Insufficient history for RSI" };

  if (!ctx.hasPosition && value < 30) {
    return { action: "buy", reason: `RSI oversold ${value.toFixed(1)}`, confidence: (30 - value) / 30 };
  }
  if (ctx.hasPosition && value > 70) {
    return { action: "sell", reason: `RSI overbought ${value.toFixed(1)}`, confidence: (value - 70) / 30 };
  }
  return { action: "hold", reason: `RSI ${value.toFixed(1)}` };
}

const gridBooks = new Map<string, GridBook>();

export function effectiveGridSpacingPct(): number {
  const { spacingPct, takerFeePct, minNetEdgeMultiplier } = TRADING_CONFIG.grid;
  const roundTripFee = takerFeePct * 2;
  const feeFloor = roundTripFee * minNetEdgeMultiplier;
  return Math.max(spacingPct, feeFloor);
}

function recentMid(history: PricePoint[], lookback: number): number {
  const slice = history.slice(-lookback);
  if (slice.length === 0) return 0;
  const sum = slice.reduce((acc, p) => acc + p.price, 0);
  return sum / slice.length;
}

function rebuildGrid(symbol: string, mid: number, spacingPct: number): GridBook {
  const prev = gridBooks.get(symbol);
  const book: GridBook = {
    mid,
    spacingPct,
    builtAt: Date.now(),
    lastSide: prev?.lastSide,
    lastLevel: prev?.lastLevel,
    lastFillPrice: prev?.lastFillPrice,
    lastFillAt: prev?.lastFillAt,
    stackedBuys: prev?.stackedBuys ?? 0,
    reserved: prev?.reserved,
  };
  gridBooks.set(symbol, book);
  return book;
}

function markFill(book: GridBook, side: Side, level: number, price: number): void {
  book.lastSide = side;
  book.lastLevel = level;
  book.lastFillPrice = price;
  book.lastFillAt = Date.now();
  book.reserved = true;
  const stacked = book.stackedBuys ?? 0;
  if (side === "buy") book.stackedBuys = stacked + 1;
  else book.stackedBuys = Math.max(0, stacked - 1);
}

function flipBlocked(book: GridBook, nextSide: Side, nextLevel: number): string | null {
  const { minHoldMs, minLevelsBeforeFlip } = TRADING_CONFIG.grid;
  if (!book.lastSide || book.lastFillAt == null || book.lastLevel == null) return null;
  if (book.lastSide === nextSide) return null;

  const age = Date.now() - book.lastFillAt;
  if (age < minHoldMs) {
    const waitSec = Math.ceil((minHoldMs - age) / 1000);
    return `Grid hold: anti-whipsaw ${waitSec}s left after ${book.lastSide}`;
  }

  const walked = Math.abs(nextLevel - book.lastLevel);
  if (walked < minLevelsBeforeFlip) {
    return `Grid hold: need ${minLevelsBeforeFlip} rungs to flip (walked ${walked})`;
  }
  return null;
}

/** Signed level index: negative = below mid (buy rungs), positive = above mid (sell rungs). */
export function gridLevelIndex(price: number, mid: number, spacingPct: number): number {
  if (mid <= 0 || spacingPct <= 0) return 0;
  const driftPct = ((price - mid) / mid) * 100;
  return Math.trunc(driftPct / spacingPct);
}

function priceAtLevel(mid: number, spacingPct: number, level: number): number {
  return mid * (1 + (spacingPct / 100) * level);
}

/**
 * Grid strategy (Hour 7+)
 * - Even % spacing around a mid price
 * - Spacing is never thinner than fee-aware net edge
 * - Uses the nearest crossed level (not only ±1)
 * - Skips repeating the same side+level until price walks to another rung
 * - Anti-whipsaw: min hold + min rungs before flipping side
 * - Inventory ladder: allow extra buys while holding, up to maxStackedBuys,
 *   but only on a strictly lower rung than the last buy
 * - Rebalances (recenters) when price walks off the book
 * - Unconfirmed reservations older than reservationTtlMs are rolled back
 */
export function gridStrategy(ctx: StrategyContext): StrategySignal {
  const cfg = TRADING_CONFIG.grid;
  if (ctx.history.length < 10 || ctx.currentPrice <= 0) {
    return { action: "hold", reason: "Warming up grid" };
  }

  expireStaleGridReservation(ctx.symbol);

  const spacingPct = effectiveGridSpacingPct();
  const midHint = recentMid(ctx.history, cfg.recenterLookback) || ctx.currentPrice;
  let book = gridBooks.get(ctx.symbol);

  if (!book) {
    book = rebuildGrid(ctx.symbol, midHint, spacingPct);
    return { action: "hold", reason: `Grid seeded mid=${book.mid.toFixed(4)} spacing=${spacingPct.toFixed(2)}%` };
  }

  if (Math.abs(book.spacingPct - spacingPct) > 1e-6) {
    book = rebuildGrid(ctx.symbol, midHint, spacingPct);
  }

  const driftPct = ((ctx.currentPrice - book.mid) / book.mid) * 100;
  if (Math.abs(driftPct) >= cfg.rebalanceThresholdPct) {
    book = rebuildGrid(ctx.symbol, ctx.currentPrice, spacingPct);
    book.lastSide = undefined;
    book.lastLevel = undefined;
    book.lastFillPrice = undefined;
    book.lastFillAt = undefined;
    book.reserved = false;
    return {
      action: "hold",
      reason: `Grid rebalanced mid=${book.mid.toFixed(4)} after ${driftPct.toFixed(2)}% drift`,
    };
  }

  const halfLevels = Math.max(1, Math.floor(cfg.levels / 2));
  const level = gridLevelIndex(ctx.currentPrice, book.mid, spacingPct);
  const clamped = Math.max(-halfLevels, Math.min(halfLevels, level));
  const lowerBound = priceAtLevel(book.mid, spacingPct, -halfLevels);
  const upperBound = priceAtLevel(book.mid, spacingPct, halfLevels);

  const feeAwareEdge =
    ctx.hasPosition && ctx.positionAvgEntry && ctx.positionAvgEntry > 0
      ? ((ctx.currentPrice - ctx.positionAvgEntry) / ctx.positionAvgEntry) * 100
      : book.lastFillPrice && book.lastFillPrice > 0
        ? ((ctx.currentPrice - book.lastFillPrice) / book.lastFillPrice) * 100
        : null;

  if (ctx.hasPosition && feeAwareEdge !== null && feeAwareEdge < cfg.takerFeePct * 2) {
    if (clamped > 0) {
      return {
        action: "hold",
        reason: `Grid hold: edge ${feeAwareEdge.toFixed(2)}% < round-trip fee`,
      };
    }
  }

  const alreadyFired = book.lastSide !== undefined && book.lastLevel === clamped;
  const stacked = book.stackedBuys ?? 0;

  if (clamped <= -1 && ctx.currentPrice >= lowerBound) {
    if (stacked >= cfg.maxStackedBuys) {
      return {
        action: "hold",
        reason: `Grid idle: stacked buys ${stacked}/${cfg.maxStackedBuys}`,
      };
    }
    if (alreadyFired && book.lastSide === "buy") {
      return {
        action: "hold",
        reason: `Grid idle: already bought L${clamped}`,
      };
    }
    // Scale-in only on a strictly lower (more negative) rung than the last buy.
    if (
      ctx.hasPosition &&
      book.lastSide === "buy" &&
      book.lastLevel != null &&
      clamped >= book.lastLevel
    ) {
      return {
        action: "hold",
        reason: `Grid idle: scale-in needs a lower rung than L${book.lastLevel} (at L${clamped})`,
      };
    }
    const blocked = flipBlocked(book, "buy", clamped);
    if (blocked) return { action: "hold", reason: blocked };
    const dist = ((book.mid - ctx.currentPrice) / book.mid) * 100;
    const nextStack = stacked + 1;
    markFill(book, "buy", clamped, ctx.currentPrice);
    return {
      action: "buy",
      reason: `Grid buy L${clamped} ${dist.toFixed(2)}% below mid (space ${spacingPct.toFixed(2)}%, stack ${nextStack}/${cfg.maxStackedBuys}${ctx.hasPosition ? ", scale-in" : ""})`,
      confidence: Math.min(0.45 + Math.abs(clamped) / halfLevels, 0.95),
    };
  }

  if (ctx.hasPosition && clamped >= 1 && ctx.currentPrice <= upperBound) {
    if (feeAwareEdge !== null && feeAwareEdge < spacingPct * 0.5) {
      return {
        action: "hold",
        reason: `Grid skip sell: net edge ${feeAwareEdge.toFixed(2)}% too thin vs spacing`,
      };
    }
    if (alreadyFired && book.lastSide === "sell") {
      return {
        action: "hold",
        reason: `Grid idle: already sold L${clamped}`,
      };
    }
    const blocked = flipBlocked(book, "sell", clamped);
    if (blocked) return { action: "hold", reason: blocked };
    markFill(book, "sell", clamped, ctx.currentPrice);
    return {
      action: "sell",
      reason: `Grid sell L${clamped} ${driftPct.toFixed(2)}% above mid (space ${spacingPct.toFixed(2)}%)`,
      confidence: Math.min(0.55 + clamped / halfLevels, 0.95),
    };
  }

  return {
    action: "hold",
    reason: `Grid idle mid=${book.mid.toFixed(4)} L${clamped} px=${ctx.currentPrice.toFixed(4)} stack=${stacked}`,
  };
}

/** Confirm the last reservation after OrderManager accepts the order. */
export function confirmGridReservation(symbol: string): void {
  const book = gridBooks.get(symbol);
  if (!book) return;
  book.reserved = false;
}

function undoReservation(book: GridBook): void {
  const stacked = book.stackedBuys ?? 0;
  if (book.lastSide === "buy") book.stackedBuys = Math.max(0, stacked - 1);
  else if (book.lastSide === "sell") book.stackedBuys = stacked + 1;
  book.lastSide = undefined;
  book.lastLevel = undefined;
  book.lastFillPrice = undefined;
  book.lastFillAt = undefined;
  book.reserved = false;
}

/**
 * If the last grid mark was only a reservation and the submit failed,
 * undo side/level/stack so the same rung can fire again.
 */
export function releaseGridReservation(symbol: string): boolean {
  const book = gridBooks.get(symbol);
  if (!book?.reserved || !book.lastSide) return false;
  undoReservation(book);
  return true;
}

/**
 * Roll back a reservation that was never confirmed (crash mid-submit, hung adapter).
 * Confirmed fills (reserved=false) are left alone.
 */
export function expireStaleGridReservation(symbol: string, now = Date.now()): boolean {
  const book = gridBooks.get(symbol);
  if (!book?.reserved || book.lastFillAt == null) return false;
  if (now - book.lastFillAt < TRADING_CONFIG.grid.reservationTtlMs) return false;
  undoReservation(book);
  return true;
}

export function expireStaleGridReservations(now = Date.now()): number {
  let n = 0;
  for (const symbol of gridBooks.keys()) {
    if (expireStaleGridReservation(symbol, now)) n += 1;
  }
  return n;
}

export function resetGridBooks(): void {
  gridBooks.clear();
}

export function getGridBook(symbol: string): GridBook | undefined {
  const book = gridBooks.get(symbol);
  return book ? { ...book } : undefined;
}

export function snapshotGridBooks(): Record<string, GridBook> {
  const out: Record<string, GridBook> = {};
  for (const [symbol, book] of gridBooks.entries()) {
    out[symbol] = { ...book };
  }
  return out;
}

function sanitizeOneBook(book: GridBook): GridBook | null {
  const mid = Number(book.mid);
  const spacingPct = Number(book.spacingPct);
  const builtAt = Number(book.builtAt);
  if (!Number.isFinite(mid) || mid <= 0) return null;
  if (!Number.isFinite(spacingPct) || spacingPct <= 0) return null;
  const lastSide = book.lastSide === "buy" || book.lastSide === "sell" ? book.lastSide : undefined;
  const lastLevel = book.lastLevel != null ? Number(book.lastLevel) : undefined;
  const lastFillPrice = book.lastFillPrice != null ? Number(book.lastFillPrice) : undefined;
  const lastFillAt = book.lastFillAt != null ? Number(book.lastFillAt) : undefined;
  const stackedRaw = book.stackedBuys != null ? Number(book.stackedBuys) : 0;
  return {
    mid,
    spacingPct,
    builtAt: Number.isFinite(builtAt) && builtAt > 0 ? builtAt : Date.now(),
    lastSide,
    lastLevel: lastLevel != null && Number.isFinite(lastLevel) ? lastLevel : undefined,
    lastFillPrice: lastFillPrice != null && Number.isFinite(lastFillPrice) && lastFillPrice > 0 ? lastFillPrice : undefined,
    lastFillAt: lastFillAt != null && Number.isFinite(lastFillAt) && lastFillAt > 0 ? lastFillAt : undefined,
    stackedBuys: Number.isFinite(stackedRaw) && stackedRaw > 0 ? Math.floor(stackedRaw) : 0,
    reserved: Boolean(book.reserved),
  };
}

export function hydrateGridBooks(raw: Record<string, GridBook> | null | undefined): void {
  if (!raw || typeof raw !== "object") return;
  for (const [symbol, book] of Object.entries(raw)) {
    if (!symbol || !book) continue;
    const clean = sanitizeOneBook(book);
    if (clean) gridBooks.set(symbol, clean);
  }
  expireStaleGridReservations();
}

export function runStrategy(id: StrategyId, ctx: StrategyContext): StrategySignal {
  switch (id) {
    case "momentum":
      return momentumStrategy(ctx);
    case "mean_reversion":
      return meanReversionStrategy(ctx);
    case "rsi":
      return rsiStrategy(ctx);
    case "grid":
      return gridStrategy(ctx);
    default:
      return { action: "hold", reason: "Unknown strategy" };
  }
}
