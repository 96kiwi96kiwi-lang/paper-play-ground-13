import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { averageDownReason } from "@/lib/orders/average-down";

const maxPct = TRADING_CONFIG.orders.maxAverageDownPct;

test("a buy at least maxPct under the open entry is refused", () => {
  const reason = averageDownReason("buy", "BTC/USDT", 0.5, 100, 96.5, maxPct);
  expect(reason).toMatch(/Average down \(BTC\/USDT\)/);
});

test("a new name, a shallow dip, and a missing mark still pass", () => {
  expect(averageDownReason("buy", "ETH/USDT", 0, 100, 90, maxPct)).toBeNull();
  expect(averageDownReason("buy", "ETH/USDT", 1, 100, 98, maxPct)).toBeNull();
  expect(averageDownReason("buy", "ETH/USDT", 1, 100, undefined, maxPct)).toBeNull();
});

test("sells and other symbols are not blocked by this floor", () => {
  expect(averageDownReason("sell", "SOL/USDT", 2, 100, 90, maxPct)).toBeNull();
  expect(averageDownReason("buy", "BNB/USDT", 1, 100, 100, maxPct)).toBeNull();
});
