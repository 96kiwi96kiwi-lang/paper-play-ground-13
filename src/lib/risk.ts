/**
 * Central risk engine
 * Called before every potential order (paper or live).
 *
 * Hour 5: daily loss, max drawdown, and losing streak HARD-STOP the bot.
 * Network errors, partial fills, and price gaps are first-class risk events.
 */

import { TRADING_CONFIG } from "@/config/trading";
import { notifyHardStop } from "@/lib/hard-stop-hook";

export type HardStopReason =
  | "daily_loss_limit"
  | "max_drawdown"
  | "losing_streak"
  | "price_gap"
  | "network_errors"
  | "manual"
  | string;

export interface RiskState {
  portfolioValue: number;
  cash: number;
  openPositionsCount: number;
  dailyPnlPct: number;
  drawdownPct: number;
  losingStreak: number;
  cooldownUntil: number | null;
  haltReason: string | null;
  /** Consecutive exchange/network failures */
  networkErrorStreak?: number;
  /** Last observed mid/last price per symbol */
  lastPrices?: Record<string, number>;
}

export interface RiskDecision {
  allowed: boolean;
  reason: string;
  suggestedSizeUsd?: number;
  hardStop?: boolean;
  code?: HardStopReason;
}

export type RiskLogEntry = {
  ts: number;
  symbol?: string;
  side?: "buy" | "sell";
  allowed: boolean;
  hardStop: boolean;
  reason: string;
  code?: string;
  snapshot: Pick<
    RiskState,
    "dailyPnlPct" | "drawdownPct" | "losingStreak" | "haltReason" | "openPositionsCount" | "portfolioValue"
  >;
};

const riskLog: RiskLogEntry[] = [];
const MAX_LOG = 200;

/** Max relative jump vs last tick before we refuse the order (gap risk). */
export const PRICE_GAP_LIMIT = 0.035; // 3.5%
/** Consecutive network failures that hard-stop the bot. */
export const NETWORK_ERROR_HARD_STOP = 5;

function logDecision(entry: Omit<RiskLogEntry, "ts">): void {
  riskLog.push({ ...entry, ts: Date.now() });
  if (riskLog.length > MAX_LOG) riskLog.splice(0, riskLog.length - MAX_LOG);
  const tag = entry.hardStop ? "HARD-STOP" : entry.allowed ? "ALLOW" : "BLOCK";
  console.info(
    `[risk] ${tag} ${entry.side ?? "-"} ${entry.symbol ?? "-"} — ${entry.reason}` +
      ` | daily=${entry.snapshot.dailyPnlPct.toFixed(2)}% dd=${entry.snapshot.drawdownPct.toFixed(2)}%` +
      ` streak=${entry.snapshot.losingStreak} halt=${entry.snapshot.haltReason ?? "none"}`,
  );
}

export function getRiskLog(): RiskLogEntry[] {
  return [...riskLog];
}

export function clearRiskLog(): void {
  riskLog.length = 0;
}

export function isNetworkError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  const name = err instanceof Error ? err.name : "";
  return (
    /network|timeout|ECONN|ENOTFOUND|EAI_AGAIN|fetch failed|socket|429|503|502|504/i.test(msg) ||
    name === "AbortError" ||
    name === "TimeoutError"
  );
}

export function classifyPriceGap(
  previous: number | undefined,
  current: number,
): { gap: boolean; pct: number } {
  if (!previous || previous <= 0 || current <= 0) return { gap: false, pct: 0 };
  const pct = (current - previous) / previous;
  return { gap: Math.abs(pct) >= PRICE_GAP_LIMIT, pct };
}

function halt(state: RiskState, reason: string, code: HardStopReason, symbol?: string): RiskState {
  state.haltReason = reason;
  logDecision({
    allowed: false,
    hardStop: true,
    reason,
    code,
    symbol,
    snapshot: snap(state),
  });
  notifyHardStop({ reason, code });
  return state;
}

/**
 * Mutate state: if a hard-stop condition is true, set haltReason so every
 * later evaluateRisk() refuses until an operator clears the halt.
 */
export function applyHardStops(state: RiskState, currentPrice?: { symbol: string; price: number }): RiskState {
  const { risk } = TRADING_CONFIG;

  if (state.haltReason) return state;

  if (state.dailyPnlPct <= risk.dailyLossLimitPct) {
    return halt(
      state,
      `HARD-STOP daily loss limit (${state.dailyPnlPct.toFixed(2)}% ≤ ${risk.dailyLossLimitPct}%)`,
      "daily_loss_limit",
    );
  }

  if (state.drawdownPct <= risk.maxDrawdownPct) {
    return halt(
      state,
      `HARD-STOP max drawdown (${state.drawdownPct.toFixed(2)}% ≤ ${risk.maxDrawdownPct}%)`,
      "max_drawdown",
    );
  }

  if (state.losingStreak >= risk.losingStreakHardStop) {
    return halt(state, `HARD-STOP losing streak ${state.losingStreak}`, "losing_streak");
  }

  if ((state.networkErrorStreak ?? 0) >= NETWORK_ERROR_HARD_STOP) {
    return halt(state, `HARD-STOP network error streak ${state.networkErrorStreak}`, "network_errors");
  }

  if (currentPrice) {
    const prev = state.lastPrices?.[currentPrice.symbol];
    const { gap, pct } = classifyPriceGap(prev, currentPrice.price);
    if (gap) {
      return halt(
        state,
        `HARD-STOP price gap on ${currentPrice.symbol} (${(pct * 100).toFixed(2)}%)`,
        "price_gap",
        currentPrice.symbol,
      );
    }
  }

  return state;
}

export function recordNetworkOutcome(state: RiskState, err: unknown | null): RiskState {
  if (err && isNetworkError(err)) {
    state.networkErrorStreak = (state.networkErrorStreak ?? 0) + 1;
    applyHardStops(state);
  } else if (!err) {
    state.networkErrorStreak = 0;
  }
  return state;
}

export function recordPartialFill(filled: number, amount: number): void {
  const pct = amount > 0 ? filled / amount : 0;
  console.info(
    `[risk] PARTIAL FILL accepted filled=${filled} / ${amount} (${(pct * 100).toFixed(1)}%) — portfolio will update only filled qty`,
  );
}

function snap(state: RiskState): RiskLogEntry["snapshot"] {
  return {
    dailyPnlPct: state.dailyPnlPct,
    drawdownPct: state.drawdownPct,
    losingStreak: state.losingStreak,
    haltReason: state.haltReason,
    openPositionsCount: state.openPositionsCount,
    portfolioValue: state.portfolioValue,
  };
}

export function evaluateRisk(
  state: RiskState,
  side: "buy" | "sell",
  symbol: string,
): RiskDecision {
  const { risk } = TRADING_CONFIG;
  const now = Date.now();

  applyHardStops(state);

  const finish = (decision: RiskDecision): RiskDecision => {
    logDecision({
      symbol,
      side,
      allowed: decision.allowed,
      hardStop: Boolean(decision.hardStop || state.haltReason),
      reason: decision.reason,
      code: decision.code,
      snapshot: snap(state),
    });
    return decision;
  };

  if (state.haltReason) {
    return finish({
      allowed: false,
      hardStop: true,
      reason: `Halted: ${state.haltReason}`,
      code: "manual",
    });
  }

  if (state.cooldownUntil && now < state.cooldownUntil) {
    const remaining = Math.ceil((state.cooldownUntil - now) / 1000);
    return finish({ allowed: false, reason: `Cooldown ${remaining}s remaining` });
  }

  if (state.dailyPnlPct <= risk.dailyLossLimitPct) {
    return finish({
      allowed: false,
      hardStop: true,
      code: "daily_loss_limit",
      reason: `Daily loss limit hit (${state.dailyPnlPct.toFixed(1)}%)`,
    });
  }

  if (state.drawdownPct <= risk.maxDrawdownPct) {
    return finish({
      allowed: false,
      hardStop: true,
      code: "max_drawdown",
      reason: `Max drawdown reached (${state.drawdownPct.toFixed(1)}%)`,
    });
  }

  if (state.losingStreak >= risk.losingStreakHardStop) {
    return finish({
      allowed: false,
      hardStop: true,
      code: "losing_streak",
      reason: `Losing streak ${state.losingStreak} – hard stop`,
    });
  }

  if (side === "buy" && state.openPositionsCount >= risk.maxOpenPositions) {
    return finish({
      allowed: false,
      reason: `Max open positions (${risk.maxOpenPositions}) reached`,
    });
  }

  if (side === "buy") {
    const target = state.portfolioValue * risk.tradeSizePct;
    const maxByCash = state.cash * 0.98;
    const size = Math.min(target, maxByCash, state.portfolioValue * risk.maxPositionPct);

    if (size < 10) {
      return finish({ allowed: false, reason: "Position size too small (< $10)" });
    }

    return finish({
      allowed: true,
      reason: "Risk checks passed",
      suggestedSizeUsd: size,
    });
  }

  return finish({ allowed: true, reason: "Risk checks passed" });
}
