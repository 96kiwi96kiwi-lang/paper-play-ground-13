/**
 * Strategy engine – mode agnostic
 * Works with any ExchangeAdapter (paper or kucoin).
 */

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

/**
 * Simple Grid strategy (high trade frequency)
 * Places buy below current price and sell above.
 */
export function gridStrategy(ctx: StrategyContext): StrategySignal {
  if (ctx.history.length < 10) return { action: "hold", reason: "Warming up grid" };

  const recent = ctx.history.slice(-20).map((p) => p.price);
  const min = Math.min(...recent);
  const max = Math.max(...recent);
  const range = max - min;
  if (range <= 0) return { action: "hold", reason: "No range" };

  const positionInRange = (ctx.currentPrice - min) / range;

  if (!ctx.hasPosition && positionInRange < 0.35) {
    return { action: "buy", reason: `Grid lower zone (${(positionInRange * 100).toFixed(0)}%)`, confidence: 0.6 };
  }
  if (ctx.hasPosition && positionInRange > 0.65) {
    return { action: "sell", reason: `Grid upper zone (${(positionInRange * 100).toFixed(0)}%)`, confidence: 0.6 };
  }
  return { action: "hold", reason: `Grid mid zone` };
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
