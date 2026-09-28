/**
 * Bot engine – orchestrates strategy + risk + exchange
 * Works in both paper and live modes.
 */

import { TRADING_CONFIG, type StrategyId } from "@/config/trading";
import {
  confirmGridReservation,
  getGridBook,
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
 * Grid markFill decrements stackedBuys before the submit is accepted.
 * Reconstruct the pre-reservation stack so one sell unwinds one rung.
 */
export function gridSellRungAmount(symbol: string, held: number): number {
  if (held <= 1e-12) return 0;
  const book = getGridBook(symbol);
  const stackedAfter = book?.stackedBuys ?? 0;
  const reservedSell = Boolean(book?.reserved && book.lastSide === "sell");
  const stackedBefore = reservedSell ? stackedAfter + 1 : Math.max(1, stackedAfter);
  return held / stackedBefore;
}

/**
 * Full path: strategy → risk → OrderManager → adapter (Paper or KuCoin).
 * Same interface regardless of exchange. No UI changes.
 * Grid rung reservations are confirmed only after an accepted submit.
 * Sells are clamped to booked inventory so OrderManager never shorts.
 * evaluateRisk does not size sells — default to held inventory, grid sells one rung.
 * Dust leftover below minOrderNotionalUsd is flattened into the same sell.
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
  let amount = input.currentPrice > 0 && sizeUsd > 0 ? sizeUsd / input.currentPrice : 0;

  if (tick.action === "sell") {
    const held = manager.positionAmount(input.symbol);
    if (held <= 1e-12) {
      if (input.strategy === "grid") releaseGridReservation(input.symbol);
      return {
        tick: {
          ...tick,
          shouldExecute: false,
          riskAllowed: false,
          riskReason: `Inventory: no long position in ${input.symbol}`,
        },
      };
    }
    if (amount <= 1e-12) amount = held;
    amount = Math.min(amount, held);
    if (input.strategy === "grid") {
      const rung = gridSellRungAmount(input.symbol, held);
      if (rung > 1e-12) amount = Math.min(amount, rung);
    }
    const minN = TRADING_CONFIG.orders.minOrderNotionalUsd;
    const maxN = TRADING_CONFIG.orders.maxOrderNotionalUsd;
    const px = input.currentPrice;
    if (px > 0) {
      const sellNotional = amount * px;
      const heldNotional = held * px;
      const leftoverNotional = Math.max(0, held - amount) * px;
      // Do not leave an unsellable dust crumb; flatten when leftover or rung is dust.
      if (leftoverNotional > 0 && leftoverNotional < minN && heldNotional <= maxN) {
        amount = held;
      } else if (sellNotional < minN && heldNotional >= minN && heldNotional <= maxN) {
        amount = held;
      }
    }
  }

  if (amount <= 1e-12) {
    if (input.strategy === "grid") releaseGridReservation(input.symbol);
    return {
      tick: {
        ...tick,
        shouldExecute: false,
        riskAllowed: false,
        riskReason: "Order size is zero after inventory / grid rung clamp",
      },
    };
  }

  try {
    const submit = await manager.submit(
      {
        symbol: input.symbol,
        side: tick.action,
        amount,
        type: "market",
        price: input.currentPrice > 0 ? input.currentPrice : undefined,
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
