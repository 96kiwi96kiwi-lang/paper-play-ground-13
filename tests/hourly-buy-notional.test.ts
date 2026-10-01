import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import {
  acceptedBuyNotionalInWindow,
  acceptedBuyNotionalInWindowForSymbol,
  hourlyBuyNotionalPerSymbolReason,
  hourlyBuyNotionalReason,
} from "@/lib/orders/hourly-buy-notional";

const cap = TRADING_CONFIG.orders.maxHourlyBuyNotionalUsd;
const perSymbol = TRADING_CONFIG.orders.maxHourlyBuyNotionalPerSymbolUsd;
const windowMs = TRADING_CONFIG.orders.hourlyBuyWindowMs;

test("sells skip the hourly buy-notional floor", () => {
  expect(hourlyBuyNotionalReason("sell", 9_999, 9_999, cap)).toBeNull();
  expect(hourlyBuyNotionalPerSymbolReason("sell", "BTC/USDT", 9_999, 9_999, perSymbol)).toBeNull();
});

test("buy that would pass the rolling cap is refused", () => {
  const reason = hourlyBuyNotionalReason("buy", 400, cap - 100, cap);
  expect(reason).toMatch(/Hourly buy notional/i);
  expect(reason).toMatch(/exceed/);
});

test("buy that stays inside the cap is allowed", () => {
  expect(hourlyBuyNotionalReason("buy", 200, 400, cap)).toBeNull();
});

test("unknown notional is refused only when the cap is already booked", () => {
  expect(hourlyBuyNotionalReason("buy", undefined, cap - 1, cap)).toBeNull();
  expect(hourlyBuyNotionalReason("buy", undefined, cap, cap)).toMatch(/already at cap/);
});

test("per-symbol buy that would pass that pair's rolling cap is refused", () => {
  const reason = hourlyBuyNotionalPerSymbolReason("buy", "ETH/USDT", 200, perSymbol - 50, perSymbol);
  expect(reason).toMatch(/ETH\/USDT/);
  expect(reason).toMatch(/exceed/);
});

test("per-symbol unknown notional is refused only when that pair is already at cap", () => {
  expect(
    hourlyBuyNotionalPerSymbolReason("buy", "SOL/USDT", undefined, perSymbol - 1, perSymbol),
  ).toBeNull();
  expect(
    hourlyBuyNotionalPerSymbolReason("buy", "SOL/USDT", undefined, perSymbol, perSymbol),
  ).toMatch(/SOL\/USDT/);
});

test("accepted buys inside the window sum; rejects and older rows do not", () => {
  const now = Date.parse("2026-10-01T12:00:00.000Z");
  const inside = now - 20 * 60 * 1000;
  const edge = now - windowMs;
  const outside = now - windowMs - 1;
  const booked = acceptedBuyNotionalInWindow(
    [
      { side: "buy", status: "closed", timestamp: inside, cost: 400 },
      { side: "buy", status: "open", timestamp: inside, amount: 1, remaining: 1, price: 250 },
      { side: "buy", status: "closed", timestamp: edge, cost: 50 },
      { side: "buy", status: "rejected", timestamp: inside, cost: 9_999 },
      { side: "buy", status: "canceled", timestamp: inside, cost: 9_999 },
      { side: "sell", status: "closed", timestamp: inside, cost: 9_999 },
      { side: "buy", status: "closed", timestamp: outside, cost: 9_999 },
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
    { side: "buy", symbol: "BTC/USDT", status: "closed", timestamp: inside, cost: 400 },
    { side: "buy", symbol: "ETH/USDT", status: "closed", timestamp: inside, cost: 900 },
    { side: "buy", symbol: "BTC/USDT", status: "open", timestamp: inside, amount: 1, remaining: 1, price: 100 },
    { side: "buy", symbol: "BTC/USDT", status: "rejected", timestamp: inside, cost: 9_999 },
    { side: "buy", symbol: "BTC/USDT", status: "closed", timestamp: outside, cost: 9_999 },
  ];
  expect(acceptedBuyNotionalInWindowForSymbol(rows, "BTC/USDT", now, windowMs)).toBe(500);
  expect(acceptedBuyNotionalInWindowForSymbol(rows, "ETH/USDT", now, windowMs)).toBe(900);
  expect(acceptedBuyNotionalInWindowForSymbol(rows, "SOL/USDT", now, windowMs)).toBe(0);
});
