/**
 * Server-side trading API
 * -----------------------
 * Safe to call from server functions / loaders.
 * Never exposes API keys to the client.
 */

import { TRADING_CONFIG } from "@/config/trading";
import * as kucoin from "@/lib/exchange/kucoin";
import { assertLiveAllowed, getRuntimeMode, type TradingRuntimeMode } from "./trading-mode";

export type Mode = TradingRuntimeMode;

export interface HealthResponse {
  ok: boolean;
  mode: Mode;
  message: string;
  hasCredentials: boolean;
}

export interface BalanceResponse {
  mode: Mode;
  free: number;
  used: number;
  total: number;
  source: "paper" | "kucoin";
}

export interface TickersResponse {
  mode: Mode;
  tickers: Record<string, { last: number; bid: number; ask: number; timestamp: number }>;
  source: "paper" | "kucoin";
}

/** Current configured mode (runtime, default paper) */
export function getMode(): Mode {
  return getRuntimeMode();
}

/** Health check – safe for both modes */
export async function getHealth(): Promise<HealthResponse> {
  const mode = getMode();

  if (mode === "paper") {
    return {
      ok: true,
      mode: "paper",
      message: "Paper mode active – no real money at risk",
      hasCredentials: kucoin.hasCredentials(),
    };
  }

  const health = await kucoin.healthCheck();
  return {
    ok: health.ok,
    mode: "live",
    message: health.message,
    hasCredentials: kucoin.hasCredentials(),
  };
}

/** Balance – paper returns virtual, live hits KuCoin */
export async function getBalance(paperCash?: number): Promise<BalanceResponse> {
  const mode = getMode();

  if (mode === "paper") {
    const cash = paperCash ?? TRADING_CONFIG.paperStartingBalance;
    return {
      mode: "paper",
      free: cash,
      used: 0,
      total: cash,
      source: "paper",
    };
  }

  const bal = await kucoin.fetchBalance();
  return {
    mode: "live",
    free: bal.free,
    used: bal.used,
    total: bal.total,
    source: "kucoin",
  };
}

/** Tickers from KuCoin when live, otherwise empty (client uses CoinGecko) */
export async function getTickers(): Promise<TickersResponse> {
  const mode = getMode();

  if (mode === "paper") {
    return {
      mode: "paper",
      tickers: {},
      source: "paper",
    };
  }

  const raw = await kucoin.fetchTickers();
  const tickers: TickersResponse["tickers"] = {};
  for (const [symbol, t] of Object.entries(raw)) {
    tickers[symbol] = {
      last: t.last,
      bid: t.bid,
      ask: t.ask,
      timestamp: t.timestamp,
    };
  }

  return {
    mode: "live",
    tickers,
    source: "kucoin",
  };
}

/** Place market order – only works when mode === "live" */
export async function placeLiveMarketOrder(
  symbol: string,
  side: "buy" | "sell",
  amount: number,
) {
  assertLiveAllowed();
  return kucoin.placeMarketOrder(symbol, side, amount);
}

/** Cancel order – live only */
export async function cancelLiveOrder(orderId: string, symbol: string) {
  assertLiveAllowed();
  return kucoin.cancelOrder(orderId, symbol);
}

/** Cancel every visible open order – live only */
export async function cancelAllLiveOrders() {
  assertLiveAllowed();
  return kucoin.cancelAllOpenOrders();
}

/** Open orders – live only */
export async function getOpenOrders(symbol?: string) {
  if (getMode() !== "live") {
    return [];
  }
  return kucoin.fetchOpenOrders(symbol);
}
