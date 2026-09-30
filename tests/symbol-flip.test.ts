import { expect, test } from "vitest";
import type { UnifiedOrder } from "@/lib/exchange/types";
import {
  lastAcceptedOnSymbol,
  symbolFlipCooldownReason,
} from "@/lib/orders/symbol-flip";

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
  expect(symbolFlipCooldownReason("BTC/USDT", "buy", [], 1_000, 90_000)).toBeNull();
});

test("same-side follow-up is allowed", () => {
  const seen = [order({ id: "1", side: "buy", status: "closed", timestamp: 1_000 })];
  expect(symbolFlipCooldownReason("BTC/USDT", "buy", seen, 2_000, 90_000)).toBeNull();
});

test("opposite side inside the window is refused", () => {
  const seen = [order({ id: "1", side: "buy", status: "closed", timestamp: 1_000 })];
  const reason = symbolFlipCooldownReason("BTC/USDT", "sell", seen, 10_000, 90_000);
  expect(reason).toMatch(/Symbol flip cooldown/i);
  expect(reason).toMatch(/last buy/);
});

test("opposite side after the window is allowed", () => {
  const seen = [order({ id: "1", side: "buy", status: "closed", timestamp: 1_000 })];
  expect(symbolFlipCooldownReason("BTC/USDT", "sell", seen, 91_000, 90_000)).toBeNull();
});

test("rejected and canceled orders do not latch the cooldown", () => {
  const seen = [
    order({ id: "r", side: "buy", status: "rejected", timestamp: 5_000 }),
    order({ id: "c", side: "buy", status: "canceled", timestamp: 6_000 }),
  ];
  expect(symbolFlipCooldownReason("BTC/USDT", "sell", seen, 7_000, 90_000)).toBeNull();
});

test("other symbols are ignored", () => {
  const seen = [
    order({ id: "e", symbol: "ETH/USDT", side: "buy", status: "closed", timestamp: 1_000 }),
  ];
  expect(symbolFlipCooldownReason("BTC/USDT", "sell", seen, 2_000, 90_000)).toBeNull();
  expect(lastAcceptedOnSymbol(seen, "BTC/USDT")).toBeUndefined();
});
