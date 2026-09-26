/**
 * Bot engine – orchestrates strategy + risk + exchange
 * Works in both paper and live modes.
 */

import type { StrategyId } from "@/config/trading";
import {
  confirmGridReservation,
  releaseGridReservation,
  runStrategy,
  type StrategyContext,
} from "@/lib/strategies";
import {
  applyHardStops,
  evaluateRisk,
  recordAcceptedTrade,
  recordNetworkOutcome,
  recordPartialFill,
  type RiskState,
} from "@/lib/risk";
import type { PricePoint } from "@/lib/trading";
import type { Side } from "@/lib/exchange/types";
import type { OrderManager, SubmitResult } from "@/lib/orders/order-manager";

export interface BotTickInput {
  strategy: StrategyId;
  symbol: string; // e.g. "BTC/USDT"
  history: PricePoint[];
  currentPrice: number;
  hasPosition: boolean;
  positionAvgEntry?: number;
  riskState: RiskState;
}

export interface BotTickResult {
  action: Side | "hold";
  reason: string;
  confidence?: number;
  riskAllowed: boolean;
  riskReason: string;
  suggestedSizeUsd?: number;
  shouldExecute: boolean;
  hardStopped: boolean;
}

/**
 * One bot tick: run strategy → check risk → decide whether to execute.
 * Does NOT place the order itself – caller does that (paper or live),
 * or use executeBotTick() to go through OrderManager.
 */
export function botTick(input: BotTickInput): BotTickResult {
  applyHardStops(input.riskState, {
    symbol: input.symbol,
    price: input.currentPrice,
  });

  if (input.riskState.haltReason) {
    return {
      action: "hold",
      reason: `Bot hard-stopped: ${input.riskState.haltReason}`,
      riskAllowed: false,
      riskReason: input.riskState.haltReason,
      shouldExecute: false,
      hardStopped: true,
    };
  }

  const ctx: StrategyContext = {
    symbol: input.symbol,
    history: input.history,
    currentPrice: input.currentPrice,
    hasPosition: input.hasPosition,
    positionAvgEntry: input.positionAvgEntry,
  };

  const signal = runStrategy(input.strategy, ctx);

  if (signal.action === "hold") {
    return {
      action: "hold",
      reason: signal.reason,
      confidence: signal.confidence,
      riskAllowed: true,
      riskReason: "No trade signal",
      shouldExecute: false,
      hardStopped: false,
    };
  }

  const risk = evaluateRisk(input.riskState, signal.action, input.symbol);

  return {
    action: signal.action,
    reason: signal.reason,
    confidence: signal.confidence,
    riskAllowed: risk.allowed,
    riskReason: risk.reason,
    suggestedSizeUsd: risk.suggestedSizeUsd,
    shouldExecute: risk.allowed && !risk.hardStop,
    hardStopped: Boolean(risk.hardStop || input.riskState.haltReason),
  };
}

/**
 * Full path: strategy → risk → OrderManager → adapter (Paper or KuCoin).
 * Same interface regardless of exchange. No UI changes.
 * Grid rung reservations are confirmed only after an accepted submit.
 */
export async function executeBotTick(
  input: BotTickInput,
  manager: OrderManager,
): Promise<{ tick: BotTickResult; submit?: SubmitResult }> {
  const tick = botTick(input);
  if (!tick.shouldExecute || tick.action === "hold") {
    return { tick };
  }

  const sizeUsd = tick.suggestedSizeUsd ?? 0;
  const amount = input.currentPrice > 0 ? sizeUsd / input.currentPrice : 0;

  try {
    const submit = await manager.submit(
      {
        symbol: input.symbol,
        side: tick.action,
        amount,
        type: "market",
        reason: tick.reason,
      },
      input.riskState,
    );

    recordNetworkOutcome(input.riskState, null);

    if (submit.ok && submit.order && submit.order.status !== "rejected") {
      recordAcceptedTrade(input.riskState);
      if (input.strategy === "grid") confirmGridReservation(input.symbol);
    } else if (input.strategy === "grid") {
      releaseGridReservation(input.symbol);
    }

    if (submit.order) {
      const filled = submit.order.filled ?? 0;
      const remaining = submit.order.remaining ?? Math.max(0, submit.order.amount - filled);
      if (filled > 0 && remaining > 0) {
        recordPartialFill(filled, submit.order.amount);
      }
    }

    return { tick, submit };
  } catch (err) {
    if (input.strategy === "grid") releaseGridReservation(input.symbol);
    recordNetworkOutcome(input.riskState, err);
    throw err;
  }
}

/** Helper: map CoinGecko id → KuCoin symbol */
export function coinIdToSymbol(coinId: string): string {
  const map: Record<string, string> = {
    bitcoin: "BTC/USDT",
    ethereum: "ETH/USDT",
    solana: "SOL/USDT",
    binancecoin: "BNB/USDT",
  };
  return map[coinId] ?? `${coinId.toUpperCase()}/USDT`;
}

export function symbolToCoinId(symbol: string): string {
  const map: Record<string, string> = {
    "BTC/USDT": "bitcoin",
    "ETH/USDT": "ethereum",
    "SOL/USDT": "solana",
    "BNB/USDT": "binancecoin",
  };
  return map[symbol] ?? symbol.split("/")[0].toLowerCase();
}
