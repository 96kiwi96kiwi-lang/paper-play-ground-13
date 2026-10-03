import { afterEach, expect, test, vi } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { fetchCoinGeckoMarketSnapshot } from "@/lib/server/market-quotes";

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
