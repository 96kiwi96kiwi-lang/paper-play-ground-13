import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { workingNotionalReason, workingNotionalUsd } from "@/lib/orders/working-notional";

const cap = TRADING_CONFIG.orders.maxWorkingNotionalUsd;

test("working notional sums remaining size on open, partial, and pending orders", () => {
  const booked = workingNotionalUsd([
    { side: "buy", status: "open", amount: 1, remaining: 0.5, price: 1000 },
    { side: "sell", status: "partially_filled", amount: 2, filled: 0.5, price: 200 },
    { side: "buy", status: "pending", amount: 1, price: 100, cost: 100 },
    { side: "buy", status: "closed", amount: 9, price: 9000 },
    { side: "sell", status: "canceled", amount: 4, price: 4000 },
    { side: "buy", status: "rejected", amount: 3, price: 3000 },
  ]);
  // 500 + (1.5 * 200) + 100
  expect(booked).toBe(900);
});

test("falls back to leftover cost when a working order has no price", () => {
  const booked = workingNotionalUsd([
    { side: "sell", status: "open", amount: 4, remaining: 1, cost: 400 },
  ]);
  expect(booked).toBe(100);
});

test("refuses when booked plus this order would pass the sleeve", () => {
  const reason = workingNotionalReason(cap - 100, 200, cap);
  expect(reason).toMatch(/Working notional/);
  expect(reason).toMatch(String(cap));
});

test("allows when the next notional stays inside the sleeve", () => {
  expect(workingNotionalReason(1000, 500, cap)).toBeNull();
  expect(workingNotionalReason(0, cap, cap)).toBeNull();
});

test("unknown notional is refused only when the sleeve is already full", () => {
  expect(workingNotionalReason(cap, undefined, cap)).toMatch(/already at max/);
  expect(workingNotionalReason(cap - 1, undefined, cap)).toBeNull();
});

test("zero cap disables the floor", () => {
  expect(workingNotionalReason(99_000, 1, 0)).toBeNull();
});
