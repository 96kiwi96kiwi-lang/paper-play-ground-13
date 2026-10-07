import { afterEach, expect, test, vi } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import {
  fetchBybitMarketSnapshot,
  fetchCoinGeckoMarketSnapshot,
  fetchPublicMarketSnapshot,
} from "@/lib/server/market-quotes";

afterEach(() => vi.unstubAllGlobals());

function payload(timestamp: number) {
  return {
    bitcoin: { usd: 50_000, last_updated_at: timestamp },
    ethereum: { usd: 3_000, last_updated_at: timestamp },
    solana: { usd: 150, last_updated_at: timestamp },
    binancecoin: { usd: 600, last_updated_at: timestamp },
  };
}

test("CoinGecko source accepts complete fresh provider timestamps", async () => {
  const now = 1_700_000_000_000;
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(payload(now / 1000)))));

  const snapshot = await fetchCoinGeckoMarketSnapshot(now);

  expect(snapshot.tickers["BTC/USDT"]?.last).toBe(50_000);
  expect(snapshot.tickers["BTC/USDT"]?.timestamp).toBe(now);
  expect(snapshot.provider).toBe("coingecko");
});

test("CoinGecko source fails closed on a stale provider timestamp", async () => {
  const now = 1_700_000_000_000;
  const stale = now - TRADING_CONFIG.orders.maxPriceAgeMs - 1_000;
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(payload(stale / 1000)))));

  await expect(fetchCoinGeckoMarketSnapshot(now)).rejects.toThrow(/stale bitcoin quote/);
});

function bybitPayload(timestamp: number) {
  return {
    retCode: 0,
    time: timestamp,
    result: {
      list: [
        { symbol: "BTCUSDT", lastPrice: "51000", bid1Price: "50999", ask1Price: "51001" },
        { symbol: "ETHUSDT", lastPrice: "3100", bid1Price: "3099", ask1Price: "3101" },
        { symbol: "SOLUSDT", lastPrice: "160", bid1Price: "159", ask1Price: "161" },
        { symbol: "BNBUSDT", lastPrice: "610", bid1Price: "609", ask1Price: "611" },
      ],
    },
  };
}

test("Bybit source requires a complete fresh provider-timestamped snapshot", async () => {
  const now = 1_700_000_000_000;
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(bybitPayload(now)))));

  const snapshot = await fetchBybitMarketSnapshot(now);

  expect(snapshot.provider).toBe("bybit");
  expect(snapshot.tickers["BNB/USDT"]).toMatchObject({ last: 610, timestamp: now });
});

test("Bybit source fails closed on stale provider time", async () => {
  const now = 1_700_000_000_000;
  const stale = now - TRADING_CONFIG.orders.maxPriceAgeMs - 1;
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(bybitPayload(stale)))));

  await expect(fetchBybitMarketSnapshot(now)).rejects.toThrow(/stale provider timestamp/);
});

test("public source falls back to a complete Bybit snapshot after stale CoinGecko data", async () => {
  const now = 1_700_000_000_000;
  const stale = now - TRADING_CONFIG.orders.maxPriceAgeMs - 1;
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(payload(stale / 1000))))
    .mockResolvedValueOnce(new Response(JSON.stringify(bybitPayload(now))));
  vi.stubGlobal("fetch", fetchMock);

  const snapshot = await fetchPublicMarketSnapshot(now);

  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(snapshot.provider).toBe("bybit");
  expect(Object.keys(snapshot.tickers)).toEqual(["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"]);
});

test("public source reports both failures and never returns a partial snapshot", async () => {
  const now = 1_700_000_000_000;
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(payload(0))))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...bybitPayload(now), result: { list: [] } }))),
  );

  await expect(fetchPublicMarketSnapshot(now)).rejects.toThrow(
    /CoinGecko=.*stale bitcoin quote; Bybit=.*missing valid BTCUSDT quote/,
  );
});
