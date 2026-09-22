/**
 * Bot engine – orchestrates strategy + risk + exchange
 * Works in both paper and live modes.
 */

import { TRADING_CONFIG, type StrategyId } from "@/config/trading";
import { runStrategy, type StrategyContext } from "@/lib/strategies";
import { evaluateRisk, type RiskState } from "@/lib/risk";
import type { PricePoint } from "@/lib/trading";
import type { Side } from "@/lib/exchange/types";

export interface BotTickInput {
  strategy: StrategyId;
  symbol: string;                 // e.g. "BTC/USDT"
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
}

/**
 * One bot tick: run strategy → check risk → decide whether to execute.
 * Does NOT place the order itself – caller does that (paper or live).
 */
export function botTick(input: BotTickInput): BotTickResult {
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
    shouldExecute: risk.allowed,
  };
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
