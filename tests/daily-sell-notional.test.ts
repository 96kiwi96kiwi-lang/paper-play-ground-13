import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import {
  acceptedSellNotionalOnUtcDay,
  acceptedSellNotionalOnUtcDayForSymbol,
  dailySellNotionalPerSymbolReason,
  dailySellNotionalReason,
} from "@/lib/orders/daily-sell-notional";

const cap = TRADING_CONFIG.orders.maxDailySellNotionalUsd;
const perSymbol = TRADING_CONFIG.orders.maxDailySellNotionalPerSymbolUsd;

test("buys skip the daily sell-notional floor", () => {
  expect(dailySellNotionalReason("buy", 9_999, 9_999, cap)).toBeNull();
  expect(dailySellNotionalPerSymbolReason("buy", "BTC/USDT", 9_999, 9_999, perSymbol)).toBeNull();
});

test("sell that would pass the UTC cap is refused", () => {
  const reason = dailySellNotionalReason("sell", 600, cap - 100, cap);
  expect(reason).toMatch(/Daily sell notional/i);
  expect(reason).toMatch(/exceed/);
});

test("sell that stays inside the cap is allowed", () => {
  expect(dailySellNotionalReason("sell", 200, 400, cap)).toBeNull();
});

test("unknown notional is refused only when the cap is already booked", () => {
  expect(dailySellNotionalReason("sell", undefined, cap - 1, cap)).toBeNull();
  expect(dailySellNotionalReason("sell", undefined, cap, cap)).toMatch(/already at cap/);
});

test("per-symbol sell that would pass that pair's UTC cap is refused", () => {
  const reason = dailySellNotionalPerSymbolReason("sell", "ETH/USDT", 200, perSymbol - 50, perSymbol);
  expect(reason).toMatch(/ETH\/USDT/);
  expect(reason).toMatch(/exceed/);
});

test("per-symbol unknown notional is refused only when that pair is already at cap", () => {
  expect(
    dailySellNotionalPerSymbolReason("sell", "SOL/USDT", undefined, perSymbol - 1, perSymbol),
  ).toBeNull();
  expect(
    dailySellNotionalPerSymbolReason("sell", "SOL/USDT", undefined, perSymbol, perSymbol),
  ).toMatch(/SOL\/USDT/);
});

test("accepted sells on the current UTC day sum; rejects and other days do not", () => {
  const now = Date.parse("2026-10-01T12:00:00.000Z");
  const sameDay = Date.parse("2026-10-01T01:00:00.000Z");
  const priorDay = Date.parse("2026-09-30T23:00:00.000Z");
  const booked = acceptedSellNotionalOnUtcDay(
    [
      { side: "sell", status: "closed", timestamp: sameDay, cost: 400 },
      { side: "sell", status: "open", timestamp: sameDay, amount: 1, remaining: 1, price: 250 },
      { side: "sell", status: "rejected", timestamp: sameDay, cost: 9_999 },
      { side: "sell", status: "canceled", timestamp: sameDay, cost: 9_999 },
      { side: "buy", status: "closed", timestamp: sameDay, cost: 9_999 },
      { side: "sell", status: "closed", timestamp: priorDay, cost: 9_999 },
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
    { side: "sell", symbol: "BTC/USDT", status: "closed", timestamp: sameDay, cost: 400 },
    { side: "sell", symbol: "ETH/USDT", status: "closed", timestamp: sameDay, cost: 900 },
    { side: "sell", symbol: "BTC/USDT", status: "open", timestamp: sameDay, amount: 1, remaining: 1, price: 100 },
    { side: "sell", symbol: "BTC/USDT", status: "rejected", timestamp: sameDay, cost: 9_999 },
    { side: "sell", symbol: "BTC/USDT", status: "closed", timestamp: priorDay, cost: 9_999 },
  ];
  expect(acceptedSellNotionalOnUtcDayForSymbol(rows, "BTC/USDT", now)).toBe(500);
  expect(acceptedSellNotionalOnUtcDayForSymbol(rows, "ETH/USDT", now)).toBe(900);
  expect(acceptedSellNotionalOnUtcDayForSymbol(rows, "SOL/USDT", now)).toBe(0);
});
