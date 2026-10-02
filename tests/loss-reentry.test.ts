import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { lastLosingSellAt, lossReentryReason } from "@/lib/orders/loss-reentry";

const cooldown = TRADING_CONFIG.orders.lossReentryCooldownMs;
const minLoss = TRADING_CONFIG.orders.lossReentryMinLossPct;

test("a sell at least minLossPct under average entry is a losing exit", () => {
  const at = lastLosingSellAt(
    [
      { symbol: "BTC/USDT", side: "buy", status: "closed", price: 100, filled: 1, timestamp: 1_000 },
      { symbol: "BTC/USDT", side: "sell", status: "closed", price: 98, filled: 1, timestamp: 2_000 },
      { symbol: "ETH/USDT", side: "sell", status: "closed", price: 1, filled: 1, timestamp: 3_000 },
      { symbol: "BTC/USDT", side: "sell", status: "rejected", price: 50, filled: 1, timestamp: 4_000 },
    ],
    "BTC/USDT",
    minLoss,
  );
  expect(at).toBe(2_000);
});

test("a scratch sell and a profitable sell do not start the cooldown", () => {
  const book = [
    { symbol: "SOL/USDT", side: "buy", status: "filled", price: 100, amount: 1, timestamp: 1_000 },
    { symbol: "SOL/USDT", side: "sell", status: "filled", price: 99.7, amount: 1, timestamp: 2_000 },
    { symbol: "BNB/USDT", side: "buy", status: "closed", price: 100, filled: 2, timestamp: 1_000 },
    { symbol: "BNB/USDT", side: "sell", status: "closed", price: 101, filled: 2, timestamp: 2_000 },
  ];
  expect(lastLosingSellAt(book, "SOL/USDT", minLoss)).toBeNull();
  expect(lastLosingSellAt(book, "BNB/USDT", minLoss)).toBeNull();
});

test("buys on that symbol wait out the cooldown; sells and other pairs pass", () => {
  // Keep the synthetic timestamp positive: the helper deliberately ignores
  // missing/invalid persisted timestamps at or below zero.
  const now = 100_000;
  const lossAt = now - 60_000;
  expect(lossReentryReason("buy", "BTC/USDT", lossAt, now, cooldown)).toMatch(/Loss reentry/);
  expect(lossReentryReason("sell", "BTC/USDT", lossAt, now, cooldown)).toBeNull();
  expect(lossReentryReason("buy", "ETH/USDT", null, now, cooldown)).toBeNull();
  expect(lossReentryReason("buy", "BTC/USDT", now - cooldown, now, cooldown)).toBeNull();
});
