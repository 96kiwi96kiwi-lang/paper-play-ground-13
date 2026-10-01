import { expect, test } from "vitest";
import type { UnifiedOrder } from "@/lib/exchange/types";
import {
  lastAcceptedSameSide,
  sameSideCooldownReason,
} from "@/lib/orders/same-side-cooldown";

function order(
  partial: Partial<UnifiedOrder> & Pick<UnifiedOrder, "id" | "side" | "status" | "timestamp">,
): UnifiedOrder {
  return {
    symbol: "BTC/USDT",
    type: "market",
    amount: 0.01,
    filled: 0.01,
    cost: 100,
    ...partial,
  };
}

test("no history allows either side", () => {
  expect(sameSideCooldownReason("BTC/USDT", "buy", [], 1_000, 25_000)).toBeNull();
});

test("same-side inside the window is refused", () => {
  const seen = [order({ id: "1", side: "buy", status: "closed", timestamp: 1_000 })];
  const reason = sameSideCooldownReason("BTC/USDT", "buy", seen, 10_000, 25_000);
  expect(reason).toMatch(/Same-side cooldown/i);
  expect(reason).toMatch(/last buy/);
  expect(reason).toMatch(/wait 16000ms/);
});

test("same-side after the window is allowed", () => {
  const seen = [order({ id: "1", side: "buy", status: "filled", timestamp: 1_000 })];
  expect(sameSideCooldownReason("BTC/USDT", "buy", seen, 26_000, 25_000)).toBeNull();
});

test("opposite side does not start the same-side timer", () => {
  const seen = [order({ id: "1", side: "sell", status: "closed", timestamp: 1_000 })];
  expect(sameSideCooldownReason("BTC/USDT", "buy", seen, 2_000, 25_000)).toBeNull();
  expect(lastAcceptedSameSide(seen, "BTC/USDT", "buy")).toBeUndefined();
});

test("rejected and canceled orders do not latch the cooldown", () => {
  const seen = [
    order({ id: "r", side: "buy", status: "rejected", timestamp: 5_000 }),
    order({ id: "c", side: "buy", status: "canceled", timestamp: 6_000 }),
  ];
  expect(sameSideCooldownReason("BTC/USDT", "buy", seen, 7_000, 25_000)).toBeNull();
});

test("other symbols are ignored", () => {
  const seen = [
    order({ id: "e", symbol: "ETH/USDT", side: "buy", status: "open", timestamp: 1_000 }),
  ];
  expect(sameSideCooldownReason("BTC/USDT", "buy", seen, 2_000, 25_000)).toBeNull();
});

test("zero cooldown disables the floor", () => {
  const seen = [order({ id: "1", side: "sell", status: "pending", timestamp: 1_000 })];
  expect(sameSideCooldownReason("BTC/USDT", "sell", seen, 1_100, 0)).toBeNull();
});
