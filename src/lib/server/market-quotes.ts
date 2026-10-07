import { TRADING_CONFIG } from "@/config/trading";
import type { UnifiedTicker } from "@/lib/exchange/types";
import { COINS, type CoinId, type PricePoint } from "@/lib/trading";

export type MarketSnapshot = {
  fetchedAt: number;
  provider: "coingecko" | "bybit";
  tickers: Record<string, UnifiedTicker>;
};

export type MarketQuoteSource = (now?: number) => Promise<MarketSnapshot>;

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=" +
  `${COINS.map((coin) => coin.id).join(",")}&vs_currencies=usd&include_last_updated_at=true`;

const BYBIT_URL = "https://api.bybit.com/v5/market/tickers?category=spot";

const SYMBOL_BY_ID: Record<CoinId, string> = {
  bitcoin: "BTC/USDT",
  ethereum: "ETH/USDT",
  solana: "SOL/USDT",
  binancecoin: "BNB/USDT",
};

const BYBIT_SYMBOLS: Record<string, string> = {
  BTCUSDT: "BTC/USDT",
  ETHUSDT: "ETH/USDT",
  SOLUSDT: "SOL/USDT",
  BNBUSDT: "BNB/USDT",
};

function assertFreshProviderTimestamp(provider: string, timestamp: number, now: number): void {
  if (!(timestamp > 0) || timestamp > now || now - timestamp > TRADING_CONFIG.orders.maxPriceAgeMs) {
    throw new Error(`${provider} stale provider timestamp`);
  }
}

export async function fetchCoinGeckoMarketSnapshot(now = Date.now()): Promise<MarketSnapshot> {
  const timeout = AbortSignal.timeout(Math.min(15_000, TRADING_CONFIG.orders.maxPriceAgeMs));
  const response = await fetch(COINGECKO_URL, {
    headers: { accept: "application/json", "user-agent": "paper-play-ground/1.0" },
    signal: timeout,
  });
  if (!response.ok) throw new Error(`CoinGecko quote HTTP ${response.status}`);

  const raw = (await response.json()) as Partial<
    Record<CoinId, { usd?: unknown; last_updated_at?: unknown }>
  >;
  const tickers: Record<string, UnifiedTicker> = {};
  for (const coin of COINS) {
    const price = Number(raw[coin.id]?.usd);
    const updatedSeconds = Number(raw[coin.id]?.last_updated_at);
    const timestamp = updatedSeconds > 0 ? updatedSeconds * 1000 : 0;
    if (!(price > 0) || !Number.isFinite(price)) {
      throw new Error(`CoinGecko missing valid ${coin.id} USD quote`);
    }
    if (!(timestamp > 0) || timestamp > now || now - timestamp > TRADING_CONFIG.orders.maxPriceAgeMs) {
      throw new Error(`CoinGecko stale ${coin.id} quote`);
    }
    const symbol = SYMBOL_BY_ID[coin.id];
    tickers[symbol] = { symbol, last: price, bid: price, ask: price, timestamp };
  }
  return { fetchedAt: now, provider: "coingecko", tickers };
}

/** Public, unauthenticated fallback. Uses Bybit's response time as provider provenance. */
export async function fetchBybitMarketSnapshot(now = Date.now()): Promise<MarketSnapshot> {
  const timeout = AbortSignal.timeout(Math.min(15_000, TRADING_CONFIG.orders.maxPriceAgeMs));
  const response = await fetch(BYBIT_URL, {
    headers: { accept: "application/json", "user-agent": "paper-play-ground/1.0" },
    signal: timeout,
  });
  if (!response.ok) throw new Error(`Bybit quote HTTP ${response.status}`);

  const raw = (await response.json()) as {
    retCode?: unknown;
    time?: unknown;
    result?: { list?: Array<Record<string, unknown>> };
  };
  if (Number(raw.retCode) !== 0) throw new Error(`Bybit quote retCode ${String(raw.retCode)}`);
  const timestamp = Number(raw.time);
  assertFreshProviderTimestamp("Bybit", timestamp, now);

  const rows = new Map((raw.result?.list ?? []).map((row) => [String(row.symbol), row]));
  const tickers: Record<string, UnifiedTicker> = {};
  for (const [providerSymbol, symbol] of Object.entries(BYBIT_SYMBOLS)) {
    const row = rows.get(providerSymbol);
    const last = Number(row?.lastPrice);
    const bid = Number(row?.bid1Price);
    const ask = Number(row?.ask1Price);
    if (!(last > 0) || !(bid > 0) || !(ask > 0) || bid > ask) {
      throw new Error(`Bybit missing valid ${providerSymbol} quote`);
    }
    tickers[symbol] = { symbol, last, bid, ask, timestamp };
  }
  return { fetchedAt: now, provider: "bybit", tickers };
}

/** Prefer CoinGecko, then fall back as a complete snapshot; never mix providers. */
export async function fetchPublicMarketSnapshot(now = Date.now()): Promise<MarketSnapshot> {
  try {
    return await fetchCoinGeckoMarketSnapshot(now);
  } catch (primaryError) {
    try {
      return await fetchBybitMarketSnapshot(now);
    } catch (fallbackError) {
      const primary = primaryError instanceof Error ? primaryError.message : String(primaryError);
      const fallback = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      throw new Error(`public quotes unavailable: CoinGecko=${primary}; Bybit=${fallback}`);
    }
  }
}

export function appendMarketHistory(
  history: Record<string, PricePoint[]>,
  snapshot: MarketSnapshot,
  maxPoints = 240,
): Record<string, PricePoint[]> {
  const next: Record<string, PricePoint[]> = { ...history };
  for (const ticker of Object.values(snapshot.tickers)) {
    const points = [...(next[ticker.symbol] ?? [])];
    const last = points.at(-1);
    if (!last || last.t !== ticker.timestamp || last.price !== ticker.last) {
      points.push({ t: ticker.timestamp, price: ticker.last });
    }
    next[ticker.symbol] = points.slice(-maxPoints);
  }
  return next;
}
