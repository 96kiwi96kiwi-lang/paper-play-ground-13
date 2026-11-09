import { afterEach, expect, test, vi } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import {
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
});

test("CoinGecko source fails closed on a stale provider timestamp", async () => {
  const now = 1_700_000_000_000;
  const stale = now - TRADING_CONFIG.orders.maxPriceAgeMs - 1_000;
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(payload(stale / 1000)))));

  await expect(fetchCoinGeckoMarketSnapshot(now)).rejects.toThrow(/stale bitcoin quote/);
});

function bybitPayload(timestamp: number, overrides: Record<string, unknown> = {}) {
  return {
    retCode: 0,
    time: timestamp,
    result: {
      list: [
        { symbol: "BTCUSDT", lastPrice: "50001", bid1Price: "50000", ask1Price: "50002" },
        { symbol: "ETHUSDT", lastPrice: "3001", bid1Price: "3000", ask1Price: "3002" },
        { symbol: "SOLUSDT", lastPrice: "151", bid1Price: "150", ask1Price: "152" },
        { symbol: "BNBUSDT", lastPrice: "601", bid1Price: "600", ask1Price: "602" },
      ],
    },
    ...overrides,
  };
}

test("public source falls back to one complete fresh Bybit snapshot", async () => {
  const now = 1_700_000_000_000;
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(new Response("upstream", { status: 503 }))
    .mockResolvedValueOnce(new Response(JSON.stringify(bybitPayload(now))));
  vi.stubGlobal("fetch", fetchMock);

  const snapshot = await fetchPublicMarketSnapshot(now);

  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(snapshot.tickers).toEqual({
    "BTC/USDT": expect.objectContaining({ last: 50001, bid: 50000, ask: 50002, timestamp: now }),
    "ETH/USDT": expect.objectContaining({ last: 3001, bid: 3000, ask: 3002, timestamp: now }),
    "SOL/USDT": expect.objectContaining({ last: 151, bid: 150, ask: 152, timestamp: now }),
    "BNB/USDT": expect.objectContaining({ last: 601, bid: 600, ask: 602, timestamp: now }),
  });
});

test("public source fails closed instead of mixing an incomplete fallback", async () => {
  const now = 1_700_000_000_000;
  const incomplete = bybitPayload(now);
  incomplete.result.list.pop();
  vi.stubGlobal(
    "fetch",
    vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(payload((now - 120_000) / 1000))))
      .mockResolvedValueOnce(new Response(JSON.stringify(incomplete))),
  );

  await expect(fetchPublicMarketSnapshot(now)).rejects.toThrow(
    /CoinGecko: CoinGecko stale bitcoin quote; Bybit: Bybit missing BNB\/USDT quote/,
  );
});

test("public source rejects stale or crossed Bybit snapshots", async () => {
  const now = 1_700_000_000_000;
  const stale = bybitPayload(now - TRADING_CONFIG.orders.maxPriceAgeMs - 1);
  vi.stubGlobal(
    "fetch",
    vi.fn()
      .mockRejectedValueOnce(new Error("CoinGecko timeout"))
      .mockResolvedValueOnce(new Response(JSON.stringify(stale))),
  );
  await expect(fetchPublicMarketSnapshot(now)).rejects.toThrow(/Bybit stale provider timestamp/);

  const crossed = bybitPayload(now);
  crossed.result.list[0] = {
    symbol: "BTCUSDT",
    lastPrice: "50001",
    bid1Price: "50003",
    ask1Price: "50002",
  };
  vi.stubGlobal(
    "fetch",
    vi.fn()
      .mockRejectedValueOnce(new Error("CoinGecko timeout"))
      .mockResolvedValueOnce(new Response(JSON.stringify(crossed))),
  );
  await expect(fetchPublicMarketSnapshot(now)).rejects.toThrow(/Bybit crossed BTCUSDT quote/);
});
