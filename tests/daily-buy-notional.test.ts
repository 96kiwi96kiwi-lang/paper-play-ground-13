import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import {
  acceptedBuyNotionalOnUtcDay,
  acceptedBuyNotionalOnUtcDayForSymbol,
  dailyBuyNotionalPerSymbolReason,
  dailyBuyNotionalReason,
} from "@/lib/orders/daily-buy-notional";

const cap = TRADING_CONFIG.orders.maxDailyBuyNotionalUsd;
const perSymbol = TRADING_CONFIG.orders.maxDailyBuyNotionalPerSymbolUsd;

test("sells skip the daily buy-notional floor", () => {
  expect(dailyBuyNotionalReason("sell", 9_999, 9_999, cap)).toBeNull();
  expect(dailyBuyNotionalPerSymbolReason("sell", "BTC/USDT", 9_999, 9_999, perSymbol)).toBeNull();
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

test("per-symbol buy that would pass that pair's UTC cap is refused", () => {
  const reason = dailyBuyNotionalPerSymbolReason("buy", "ETH/USDT", 200, perSymbol - 50, perSymbol);
  expect(reason).toMatch(/ETH\/USDT/);
  expect(reason).toMatch(/exceed/);
});

test("per-symbol unknown notional is refused only when that pair is already at cap", () => {
  expect(
    dailyBuyNotionalPerSymbolReason("buy", "SOL/USDT", undefined, perSymbol - 1, perSymbol),
  ).toBeNull();
  expect(
    dailyBuyNotionalPerSymbolReason("buy", "SOL/USDT", undefined, perSymbol, perSymbol),
  ).toMatch(/SOL\/USDT/);
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

test("per-symbol sum ignores other pairs on the same UTC day", () => {
  const now = Date.parse("2026-10-01T12:00:00.000Z");
  const sameDay = Date.parse("2026-10-01T01:00:00.000Z");
  const priorDay = Date.parse("2026-09-30T23:00:00.000Z");
  const rows = [
    { side: "buy", symbol: "BTC/USDT", status: "closed", timestamp: sameDay, cost: 400 },
    { side: "buy", symbol: "ETH/USDT", status: "closed", timestamp: sameDay, cost: 900 },
    { side: "buy", symbol: "BTC/USDT", status: "open", timestamp: sameDay, amount: 1, remaining: 1, price: 100 },
    { side: "buy", symbol: "BTC/USDT", status: "rejected", timestamp: sameDay, cost: 9_999 },
    { side: "buy", symbol: "BTC/USDT", status: "closed", timestamp: priorDay, cost: 9_999 },
  ];
  expect(acceptedBuyNotionalOnUtcDayForSymbol(rows, "BTC/USDT", now)).toBe(500);
  expect(acceptedBuyNotionalOnUtcDayForSymbol(rows, "ETH/USDT", now)).toBe(900);
  expect(acceptedBuyNotionalOnUtcDayForSymbol(rows, "SOL/USDT", now)).toBe(0);
});
