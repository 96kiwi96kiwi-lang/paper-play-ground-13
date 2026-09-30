import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { staleMarketQuoteReason } from "@/lib/orders/stale-quote";

test("market submit without quotedAt is refused", () => {
  const reason = staleMarketQuoteReason(
    "market",
    undefined,
    Date.now(),
    TRADING_CONFIG.orders.maxPriceAgeMs,
  );
  expect(reason).toMatch(/quotedAt/i);
});

test("market submit with stale quotedAt is refused", () => {
  const now = Date.now();
  const reason = staleMarketQuoteReason(
    "market",
    now - TRADING_CONFIG.orders.maxPriceAgeMs - 1_000,
    now,
    TRADING_CONFIG.orders.maxPriceAgeMs,
  );
  expect(reason).toMatch(/Stale price/i);
});

test("market submit with fresh quotedAt is accepted", () => {
  const now = Date.now();
  const reason = staleMarketQuoteReason("market", now, now, TRADING_CONFIG.orders.maxPriceAgeMs);
  expect(reason).toBeNull();
});

test("limit orders skip the quote-age floor", () => {
  const reason = staleMarketQuoteReason(
    "limit",
    undefined,
    Date.now(),
    TRADING_CONFIG.orders.maxPriceAgeMs,
  );
  expect(reason).toBeNull();
});

test("future quote timestamps cannot bypass the freshness gate", () => {
  const now = Date.now();
  expect(staleMarketQuoteReason("market", now + 1, now, 1000)).toMatch(/future/i);
});
