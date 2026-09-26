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
  };
  gridBooks.set(symbol, book);
  return book;
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
 * - Rebalances (recenters) when price walks off the book
 */
export function gridStrategy(ctx: StrategyContext): StrategySignal {
  const cfg = TRADING_CONFIG.grid;
  if (ctx.history.length < 10 || ctx.currentPrice <= 0) {
    return { action: "hold", reason: "Warming up grid" };
  }

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

  if (!ctx.hasPosition && clamped <= -1 && ctx.currentPrice >= lowerBound) {
    if (alreadyFired && book.lastSide === "buy") {
      return {
        action: "hold",
        reason: `Grid idle: already bought L${clamped}`,
      };
    }
    const dist = ((book.mid - ctx.currentPrice) / book.mid) * 100;
    book.lastSide = "buy";
    book.lastLevel = clamped;
    return {
      action: "buy",
      reason: `Grid buy L${clamped} ${dist.toFixed(2)}% below mid (space ${spacingPct.toFixed(2)}%)`,
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
    book.lastSide = "sell";
    book.lastLevel = clamped;
    return {
      action: "sell",
      reason: `Grid sell L${clamped} ${driftPct.toFixed(2)}% above mid (space ${spacingPct.toFixed(2)}%)`,
      confidence: Math.min(0.55 + clamped / halfLevels, 0.95),
    };
  }

  return {
    action: "hold",
    reason: `Grid idle mid=${book.mid.toFixed(4)} L${clamped} px=${ctx.currentPrice.toFixed(4)}`,
  };
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

export function hydrateGridBooks(raw: Record<string, GridBook> | null | undefined): void {
  if (!raw || typeof raw !== "object") return;
  for (const [symbol, book] of Object.entries(raw)) {
    if (!symbol || !book) continue;
    const mid = Number(book.mid);
    const spacingPct = Number(book.spacingPct);
    const builtAt = Number(book.builtAt);
    if (!Number.isFinite(mid) || mid <= 0) continue;
    if (!Number.isFinite(spacingPct) || spacingPct <= 0) continue;
    const lastSide = book.lastSide === "buy" || book.lastSide === "sell" ? book.lastSide : undefined;
    const lastLevel = book.lastLevel != null ? Number(book.lastLevel) : undefined;
    gridBooks.set(symbol, {
      mid,
      spacingPct,
      builtAt: Number.isFinite(builtAt) && builtAt > 0 ? builtAt : Date.now(),
      lastSide,
      lastLevel: lastLevel != null && Number.isFinite(lastLevel) ? lastLevel : undefined,
    });
  }
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
