/**
 * Central risk engine
 * Called before every potential order (paper or live).
 */

import { TRADING_CONFIG } from "@/config/trading";

export interface RiskState {
  portfolioValue: number;
  cash: number;
  openPositionsCount: number;
  dailyPnlPct: number;
  drawdownPct: number;
  losingStreak: number;
  cooldownUntil: number | null;
  haltReason: string | null;
}

export interface RiskDecision {
  allowed: boolean;
  reason: string;
  suggestedSizeUsd?: number;
}

export function evaluateRisk(
  state: RiskState,
  side: "buy" | "sell",
  symbol: string,
): RiskDecision {
  const { risk } = TRADING_CONFIG;
  const now = Date.now();

  // Hard halt
  if (state.haltReason) {
    return { allowed: false, reason: `Halted: ${state.haltReason}` };
  }

  // Cooldown after losses
  if (state.cooldownUntil && now < state.cooldownUntil) {
    const remaining = Math.ceil((state.cooldownUntil - now) / 1000);
    return { allowed: false, reason: `Cooldown ${remaining}s remaining` };
  }

  // Daily loss limit
  if (state.dailyPnlPct <= risk.dailyLossLimitPct) {
    return { allowed: false, reason: `Daily loss limit hit (${state.dailyPnlPct.toFixed(1)}%)` };
  }

  // Max drawdown
  if (state.drawdownPct <= risk.maxDrawdownPct) {
    return { allowed: false, reason: `Max drawdown reached (${state.drawdownPct.toFixed(1)}%)` };
  }

  // Losing streak
  if (state.losingStreak >= risk.losingStreakHardStop) {
    return { allowed: false, reason: `Losing streak ${state.losingStreak} – hard stop` };
  }

  // Position count limit (only for buys)
  if (side === "buy" && state.openPositionsCount >= risk.maxOpenPositions) {
    return { allowed: false, reason: `Max open positions (${risk.maxOpenPositions}) reached` };
  }

  // Size calculation for buys
  if (side === "buy") {
    const target = state.portfolioValue * risk.tradeSizePct;
    const maxByCash = state.cash * 0.98; // leave a little buffer
    const size = Math.min(target, maxByCash, state.portfolioValue * risk.maxPositionPct);

    if (size < 10) {
      return { allowed: false, reason: "Position size too small (< $10)" };
    }

    return {
      allowed: true,
      reason: "Risk checks passed",
      suggestedSizeUsd: size,
    };
  }

  // Sells are generally allowed if we have a position (checked elsewhere)
  return { allowed: true, reason: "Risk checks passed" };
}
