import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import {
  acceptedBuyNotionalOnUtcDay,
  dailyBuyNotionalReason,
} from "@/lib/orders/daily-buy-notional";

const cap = TRADING_CONFIG.orders.maxDailyBuyNotionalUsd;

test("sells skip the daily buy-notional floor", () => {
  expect(dailyBuyNotionalReason("sell", 9_999, 9_999, cap)).toBeNull();
});

test("buy that would pass the UTC cap is refused", () => {
  const reason = dailyBuyNotionalReason("buy", 600, cap - 100, cap);
  expect(reason).toMatch(/Daily buy notional/i);
  expect(reason).toMatch(/exceed/);
});

test("buy that stays inside the cap is allowed", () => {
  expect(dailyBuyNotionalReason("buy", 200, 400, cap)).toBeNull();
});

test("unknown notional is refused only when the cap is already booked", () => {
  expect(dailyBuyNotionalReason("buy", undefined, cap - 1, cap)).toBeNull();
  expect(dailyBuyNotionalReason("buy", undefined, cap, cap)).toMatch(/already at cap/);
});

test("accepted buys on the current UTC day sum; rejects and other days do not", () => {
  const now = Date.parse("2026-10-01T12:00:00.000Z");
  const sameDay = Date.parse("2026-10-01T01:00:00.000Z");
  const priorDay = Date.parse("2026-09-30T23:00:00.000Z");
  const booked = acceptedBuyNotionalOnUtcDay(
    [
      { side: "buy", status: "closed", timestamp: sameDay, cost: 400 },
      { side: "buy", status: "open", timestamp: sameDay, amount: 1, remaining: 1, price: 250 },
      { side: "buy", status: "rejected", timestamp: sameDay, cost: 9_999 },
      { side: "buy", status: "canceled", timestamp: sameDay, cost: 9_999 },
      { side: "sell", status: "closed", timestamp: sameDay, cost: 9_999 },
      { side: "buy", status: "closed", timestamp: priorDay, cost: 9_999 },
    ],
    now,
  );
  expect(booked).toBe(650);
});
