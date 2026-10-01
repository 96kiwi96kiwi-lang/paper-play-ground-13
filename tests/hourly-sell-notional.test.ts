import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import {
  acceptedSellNotionalInWindow,
  acceptedSellNotionalInWindowForSymbol,
  hourlySellNotionalPerSymbolReason,
  hourlySellNotionalReason,
} from "@/lib/orders/hourly-sell-notional";

const cap = TRADING_CONFIG.orders.maxHourlySellNotionalUsd;
const perSymbol = TRADING_CONFIG.orders.maxHourlySellNotionalPerSymbolUsd;
const windowMs = TRADING_CONFIG.orders.hourlySellWindowMs;

test("buys skip the hourly sell-notional floor", () => {
  expect(hourlySellNotionalReason("buy", 9_999, 9_999, cap)).toBeNull();
  expect(hourlySellNotionalPerSymbolReason("buy", "BTC/USDT", 9_999, 9_999, perSymbol)).toBeNull();
});

test("sell that would pass the rolling cap is refused", () => {
  const reason = hourlySellNotionalReason("sell", 400, cap - 100, cap);
  expect(reason).toMatch(/Hourly sell notional/i);
  expect(reason).toMatch(/exceed/);
});

test("sell that stays inside the cap is allowed", () => {
  expect(hourlySellNotionalReason("sell", 200, 400, cap)).toBeNull();
});

test("unknown notional is refused only when the cap is already booked", () => {
  expect(hourlySellNotionalReason("sell", undefined, cap - 1, cap)).toBeNull();
  expect(hourlySellNotionalReason("sell", undefined, cap, cap)).toMatch(/already at cap/);
});

test("per-symbol sell that would pass that pair's rolling cap is refused", () => {
  const reason = hourlySellNotionalPerSymbolReason("sell", "ETH/USDT", 200, perSymbol - 50, perSymbol);
  expect(reason).toMatch(/ETH\/USDT/);
  expect(reason).toMatch(/exceed/);
});

test("per-symbol unknown notional is refused only when that pair is already at cap", () => {
  expect(
    hourlySellNotionalPerSymbolReason("sell", "SOL/USDT", undefined, perSymbol - 1, perSymbol),
  ).toBeNull();
  expect(
    hourlySellNotionalPerSymbolReason("sell", "SOL/USDT", undefined, perSymbol, perSymbol),
  ).toMatch(/SOL\/USDT/);
});

test("accepted sells inside the window sum; rejects and older rows do not", () => {
  const now = Date.parse("2026-10-01T12:00:00.000Z");
  const inside = now - 20 * 60 * 1000;
  const edge = now - windowMs;
  const outside = now - windowMs - 1;
  const booked = acceptedSellNotionalInWindow(
    [
      { side: "sell", status: "closed", timestamp: inside, cost: 400 },
      { side: "sell", status: "open", timestamp: inside, amount: 1, remaining: 1, price: 250 },
      { side: "sell", status: "closed", timestamp: edge, cost: 50 },
      { side: "sell", status: "rejected", timestamp: inside, cost: 9_999 },
      { side: "sell", status: "canceled", timestamp: inside, cost: 9_999 },
      { side: "buy", status: "closed", timestamp: inside, cost: 9_999 },
      { side: "sell", status: "closed", timestamp: outside, cost: 9_999 },
    ],
    now,
    windowMs,
  );
  expect(booked).toBe(700);
});

test("per-symbol sum ignores other pairs inside the same window", () => {
  const now = Date.parse("2026-10-01T12:00:00.000Z");
  const inside = now - 10 * 60 * 1000;
  const outside = now - windowMs - 5_000;
  const rows = [
    { side: "sell", symbol: "BTC/USDT", status: "closed", timestamp: inside, cost: 400 },
    { side: "sell", symbol: "ETH/USDT", status: "closed", timestamp: inside, cost: 900 },
    { side: "sell", symbol: "BTC/USDT", status: "open", timestamp: inside, amount: 1, remaining: 1, price: 100 },
    { side: "sell", symbol: "BTC/USDT", status: "rejected", timestamp: inside, cost: 9_999 },
    { side: "sell", symbol: "BTC/USDT", status: "closed", timestamp: outside, cost: 9_999 },
  ];
  expect(acceptedSellNotionalInWindowForSymbol(rows, "BTC/USDT", now, windowMs)).toBe(500);
  expect(acceptedSellNotionalInWindowForSymbol(rows, "ETH/USDT", now, windowMs)).toBe(900);
  expect(acceptedSellNotionalInWindowForSymbol(rows, "SOL/USDT", now, windowMs)).toBe(0);
});

test("hourly sell caps sit above the hourly buy floors", () => {
  expect(cap).toBeGreaterThan(TRADING_CONFIG.orders.maxHourlyBuyNotionalUsd);
  expect(perSymbol).toBeGreaterThan(TRADING_CONFIG.orders.maxHourlyBuyNotionalPerSymbolUsd);
  expect(cap).toBeLessThan(TRADING_CONFIG.orders.maxDailySellNotionalUsd);
});
