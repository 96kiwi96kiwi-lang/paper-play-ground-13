import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { sellDustRemainderReason } from "@/lib/orders/sell-dust";

const minN = TRADING_CONFIG.orders.minOrderNotionalUsd;

test("buys skip the sell-dust floor", () => {
  expect(sellDustRemainderReason("buy", 1, 0.5, 100, minN)).toBeNull();
});

test("full flatten is allowed", () => {
  expect(sellDustRemainderReason("sell", 1, 1, 100, minN)).toBeNull();
});

test("leftover above min notional is allowed", () => {
  expect(sellDustRemainderReason("sell", 2, 1, 100, minN)).toBeNull();
});

test("leftover below min notional is refused", () => {
  const reason = sellDustRemainderReason("sell", 0.2, 0.15, 50, minN);
  expect(reason).toMatch(/Sell dust/i);
  expect(reason).toMatch(/min notional/);
});

test("unknown price skips the floor", () => {
  expect(sellDustRemainderReason("sell", 0.2, 0.15, undefined, minN)).toBeNull();
});
