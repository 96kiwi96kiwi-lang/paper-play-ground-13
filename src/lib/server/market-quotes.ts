import { TRADING_CONFIG } from "@/config/trading";
import type { UnifiedTicker } from "@/lib/exchange/types";
import { COINS, type CoinId, type PricePoint } from "@/lib/trading";

export type MarketSnapshot = {
  fetchedAt: number;
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

const SYMBOL_BY_BYBIT: Record<string, string> = {
  BTCUSDT: "BTC/USDT",
  ETHUSDT: "ETH/USDT",
  SOLUSDT: "SOL/USDT",
  BNBUSDT: "BNB/USDT",
};

function quoteTimeout(): AbortSignal {
  return AbortSignal.timeout(Math.min(15_000, TRADING_CONFIG.orders.maxPriceAgeMs));
}

function validProviderTime(timestamp: number, now: number): boolean {
  return timestamp > 0 && timestamp <= now && now - timestamp <= TRADING_CONFIG.orders.maxPriceAgeMs;
}

export async function fetchCoinGeckoMarketSnapshot(now = Date.now()): Promise<MarketSnapshot> {
  const response = await fetch(COINGECKO_URL, {
    headers: { accept: "application/json", "user-agent": "paper-play-ground/1.0" },
    signal: quoteTimeout(),
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
    if (!validProviderTime(timestamp, now)) {
      throw new Error(`CoinGecko stale ${coin.id} quote`);
    }
    const symbol = SYMBOL_BY_ID[coin.id];
    tickers[symbol] = { symbol, last: price, bid: price, ask: price, timestamp };
  }
  return { fetchedAt: now, tickers };
}

export async function fetchBybitMarketSnapshot(now = Date.now()): Promise<MarketSnapshot> {
  const response = await fetch(BYBIT_URL, {
    headers: { accept: "application/json", "user-agent": "paper-play-ground/1.0" },
    signal: quoteTimeout(),
  });
  if (!response.ok) throw new Error(`Bybit quote HTTP ${response.status}`);

  const raw = (await response.json()) as {
    retCode?: unknown;
    time?: unknown;
    result?: { list?: unknown };
  };
  if (Number(raw.retCode) !== 0) throw new Error("Bybit quote response was not successful");

  const timestamp = Number(raw.time);
  if (!validProviderTime(timestamp, now)) throw new Error("Bybit stale provider timestamp");
  if (!Array.isArray(raw.result?.list)) throw new Error("Bybit quote list is missing");

  const tickers: Record<string, UnifiedTicker> = {};
  for (const value of raw.result.list) {
    if (!value || typeof value !== "object") continue;
    const row = value as Record<string, unknown>;
    const sourceSymbol = String(row.symbol ?? "");
    const symbol = SYMBOL_BY_BYBIT[sourceSymbol];
    if (!symbol) continue;

    const last = Number(row.lastPrice);
    const bid = Number(row.bid1Price);
    const ask = Number(row.ask1Price);
    if (![last, bid, ask].every((price) => price > 0 && Number.isFinite(price))) {
      throw new Error(`Bybit invalid ${sourceSymbol} quote`);
    }
    if (bid > ask) throw new Error(`Bybit crossed ${sourceSymbol} quote`);
    tickers[symbol] = { symbol, last, bid, ask, timestamp };
  }

  for (const symbol of Object.values(SYMBOL_BY_BYBIT)) {
    if (!tickers[symbol]) throw new Error(`Bybit missing ${symbol} quote`);
  }
  return { fetchedAt: now, tickers };
}

export async function fetchPublicMarketSnapshot(now = Date.now()): Promise<MarketSnapshot> {
  try {
    return await fetchCoinGeckoMarketSnapshot(now);
  } catch (coinGeckoError) {
    try {
      return await fetchBybitMarketSnapshot(now);
    } catch (bybitError) {
      const coinGecko = coinGeckoError instanceof Error ? coinGeckoError.message : String(coinGeckoError);
      const bybit = bybitError instanceof Error ? bybitError.message : String(bybitError);
      throw new Error(`Public quotes unavailable: CoinGecko: ${coinGecko}; Bybit: ${bybit}`);
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
