/**
 * KuCoin exchange adapter (server-side only)
 * -----------------------------------------
 * Uses CCXT. Never import this file from client components.
 */

import ccxt from "ccxt";
import { TRADING_CONFIG } from "@/config/trading";

export type Balance = {
  free: number;
  used: number;
  total: number;
};

export type Ticker = {
  symbol: string;
  last: number;
  bid: number;
  ask: number;
  timestamp: number;
};

export type OrderResult = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit";
  amount: number;
  price?: number;
  status: string;
  filled: number;
  remaining: number;
  cost: number;
  timestamp: number;
};

let exchange: ccxt.kucoin | null = null;

function getExchange(): ccxt.kucoin {
  if (exchange) return exchange;

  const apiKey = process.env.KUCOIN_API_KEY ?? "";
  const secret = process.env.KUCOIN_SECRET ?? "";
  const password = process.env.KUCOIN_PASSWORD ?? "";

  if (!apiKey || !secret || !password) {
    throw new Error(
      "KuCoin API credentials missing. Set KUCOIN_API_KEY, KUCOIN_SECRET and KUCOIN_PASSWORD environment variables.",
    );
  }

  exchange = new ccxt.kucoin({
    apiKey,
    secret,
    password,
    enableRateLimit: true,
    options: {
      defaultType: "spot",
    },
  });

  return exchange;
}

/** Check if we have valid credentials (without throwing) */
export function hasCredentials(): boolean {
  return Boolean(
    process.env.KUCOIN_API_KEY &&
      process.env.KUCOIN_SECRET &&
      process.env.KUCOIN_PASSWORD,
  );
}

/** Fetch USDT balance */
export async function fetchBalance(): Promise<Balance> {
  const ex = getExchange();
  const bal = await ex.fetchBalance();
  const usdt = bal["USDT"] ?? { free: 0, used: 0, total: 0 };
  return {
    free: Number(usdt.free) || 0,
    used: Number(usdt.used) || 0,
    total: Number(usdt.total) || 0,
  };
}

/** Fetch tickers for configured pairs */
export async function fetchTickers(): Promise<Record<string, Ticker>> {
  const ex = getExchange();
  const symbols = [...TRADING_CONFIG.pairs];
  const raw = await ex.fetchTickers(symbols);

  const result: Record<string, Ticker> = {};
  for (const symbol of symbols) {
    const t = raw[symbol];
    if (t) {
      result[symbol] = {
        symbol,
        last: t.last ?? 0,
        bid: t.bid ?? 0,
        ask: t.ask ?? 0,
        timestamp: t.timestamp ?? Date.now(),
      };
    }
  }
  return result;
}

/** Place a market order (spot) */
export async function placeMarketOrder(
  symbol: string,
  side: "buy" | "sell",
  amount: number,
): Promise<OrderResult> {
  if (TRADING_CONFIG.mode !== "live") {
    throw new Error("Live trading is disabled. Set mode to 'live' only after explicit confirmation.");
  }

  const ex = getExchange();
  const order = await ex.createOrder(symbol, "market", side, amount);

  return {
    id: String(order.id),
    symbol: order.symbol ?? symbol,
    side,
    type: "market",
    amount: order.amount ?? amount,
    price: order.price,
    status: order.status ?? "unknown",
    filled: order.filled ?? 0,
    remaining: order.remaining ?? 0,
    cost: order.cost ?? 0,
    timestamp: order.timestamp ?? Date.now(),
  };
}

/** Place a limit order */
export async function placeLimitOrder(
  symbol: string,
  side: "buy" | "sell",
  amount: number,
  price: number,
): Promise<OrderResult> {
  if (TRADING_CONFIG.mode !== "live") {
    throw new Error("Live trading is disabled.");
  }

  const ex = getExchange();
  const order = await ex.createOrder(symbol, "limit", side, amount, price);

  return {
    id: String(order.id),
    symbol: order.symbol ?? symbol,
    side,
    type: "limit",
    amount: order.amount ?? amount,
    price: order.price ?? price,
    status: order.status ?? "unknown",
    filled: order.filled ?? 0,
    remaining: order.remaining ?? 0,
    cost: order.cost ?? 0,
    timestamp: order.timestamp ?? Date.now(),
  };
}

/** Cancel an open order */
export async function cancelOrder(orderId: string, symbol: string): Promise<void> {
  const ex = getExchange();
  await ex.cancelOrder(orderId, symbol);
}

/** Fetch open orders */
export async function fetchOpenOrders(symbol?: string) {
  const ex = getExchange();
  return ex.fetchOpenOrders(symbol);
}

/** Simple health check */
export async function healthCheck(): Promise<{ ok: boolean; message: string }> {
  try {
    if (!hasCredentials()) {
      return { ok: false, message: "Missing API credentials" };
    }
    const ex = getExchange();
    await ex.fetchTime();
    return { ok: true, message: "Connected to KuCoin" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
