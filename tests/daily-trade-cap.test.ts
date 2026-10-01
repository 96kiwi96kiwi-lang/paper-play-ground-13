import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import {
  acceptedTradeCountOnUtcDay,
  acceptedTradeCountOnUtcDayForSymbol,
  dailyTradeCapPerSymbolReason,
} from "@/lib/orders/daily-trade-cap";

const cap = TRADING_CONFIG.risk.maxDailyTradesPerSymbol;

test("per-symbol cap refuses when booked count already meets the limit", () => {
  const reason = dailyTradeCapPerSymbolReason("BTC/USDT", cap, cap);
  expect(reason).toMatch(/Daily trade cap \(BTC\/USDT\)/);
  expect(reason).toMatch(String(cap));
});

test("per-symbol cap allows when under the limit", () => {
  expect(dailyTradeCapPerSymbolReason("ETH/USDT", cap - 1, cap)).toBeNull();
  expect(dailyTradeCapPerSymbolReason("ETH/USDT", 0, cap)).toBeNull();
});

test("zero cap disables the floor", () => {
  expect(dailyTradeCapPerSymbolReason("SOL/USDT", 99, 0)).toBeNull();
});

test("accepted trades on the current UTC day count; rejects and other days do not", () => {
  const now = Date.parse("2026-10-01T12:00:00.000Z");
  const sameDay = Date.parse("2026-10-01T01:00:00.000Z");
  const priorDay = Date.parse("2026-09-30T23:00:00.000Z");
  const booked = acceptedTradeCountOnUtcDay(
    [
      { side: "buy", status: "closed", timestamp: sameDay },
      { side: "sell", status: "open", timestamp: sameDay },
      { side: "buy", status: "rejected", timestamp: sameDay },
      { side: "buy", status: "canceled", timestamp: sameDay },
      { side: "sell", status: "closed", timestamp: priorDay },
    ],
    now,
  );
  expect(booked).toBe(2);
});

test("per-symbol count ignores other pairs on the same UTC day", () => {
  const now = Date.parse("2026-10-01T12:00:00.000Z");
  const sameDay = Date.parse("2026-10-01T01:00:00.000Z");
  const priorDay = Date.parse("2026-09-30T23:00:00.000Z");
  const rows = [
    { side: "buy", symbol: "BTC/USDT", status: "closed", timestamp: sameDay },
    { side: "sell", symbol: "BTC/USDT", status: "open", timestamp: sameDay },
    { side: "buy", symbol: "ETH/USDT", status: "closed", timestamp: sameDay },
    { side: "buy", symbol: "BTC/USDT", status: "rejected", timestamp: sameDay },
    { side: "buy", symbol: "BTC/USDT", status: "closed", timestamp: priorDay },
  ];
  expect(acceptedTradeCountOnUtcDayForSymbol(rows, "BTC/USDT", now)).toBe(2);
  expect(acceptedTradeCountOnUtcDayForSymbol(rows, "ETH/USDT", now)).toBe(1);
  expect(acceptedTradeCountOnUtcDayForSymbol(rows, "SOL/USDT", now)).toBe(0);
});
