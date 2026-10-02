import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { openSlotReason, openSlotSymbols } from "@/lib/orders/open-slots";

const cap = TRADING_CONFIG.risk.maxOpenPositions;

test("held names and working buys count; dust, sells, and rejects do not", () => {
  const positions = {
    "BTC/USDT": { amount: 0.01 },
    "SOL/USDT": { amount: 1e-12 },
  };
  const working = [
    { symbol: "ETH/USDT", side: "buy", status: "open" },
    { symbol: "BNB/USDT", side: "sell", status: "open" },
    { symbol: "SOL/USDT", side: "buy", status: "rejected" },
    { symbol: "SOL/USDT", side: "buy", status: "canceled" },
  ];
  expect(openSlotSymbols(positions, working)).toEqual(["BTC/USDT", "ETH/USDT"]);
});

test("a new symbol is refused at the cap; an add and a sell still pass", () => {
  const slots = ["BTC/USDT", "ETH/USDT", "SOL/USDT"];
  expect(slots.length).toBe(cap);
  expect(openSlotReason("buy", "BNB/USDT", slots, cap)).toMatch(/Open slots/);
  expect(openSlotReason("buy", "ETH/USDT", slots, cap)).toBeNull();
  expect(openSlotReason("sell", "BNB/USDT", slots, cap)).toBeNull();
});

test("room under the cap allows a new name", () => {
  expect(openSlotReason("buy", "BNB/USDT", ["BTC/USDT"], cap)).toBeNull();
});
