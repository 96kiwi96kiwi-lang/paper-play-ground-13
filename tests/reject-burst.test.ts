import { expect, test } from "vitest";
import type { UnifiedOrder } from "@/lib/exchange/types";
import {
  rejectBurstPerSymbolReason,
  rejectBurstReason,
  rejectedCountInWindow,
  rejectedCountInWindowForSymbol,
} from "@/lib/orders/reject-burst";

const WINDOW = 10 * 60 * 1000;
const NOW = 1_000_000;

function order(
  partial: Partial<UnifiedOrder> & Pick<UnifiedOrder, "id" | "status" | "timestamp">,
): UnifiedOrder {
  return {
    symbol: "BTC/USDT",
    side: "buy",
    type: "market",
    amount: 0.01,
    filled: 0,
    cost: 0,
    ...partial,
  };
}

function rejects(n: number, symbol = "BTC/USDT", ageMs = 1_000): UnifiedOrder[] {
  return Array.from({ length: n }, (_, i) =>
    order({
      id: `${symbol}-${i}`,
      symbol,
      status: "rejected",
      timestamp: NOW - ageMs - i,
    }),
  );
}

test("empty book allows submits", () => {
  expect(rejectedCountInWindow([], NOW, WINDOW)).toBe(0);
  expect(rejectBurstReason(0, 4, WINDOW)).toBeNull();
  expect(rejectBurstPerSymbolReason("BTC/USDT", 0, 3, WINDOW)).toBeNull();
});

test("count under the cap is allowed", () => {
  const seen = rejects(3);
  expect(rejectedCountInWindow(seen, NOW, WINDOW)).toBe(3);
  expect(rejectBurstReason(3, 4, WINDOW)).toBeNull();
});

test("book-wide cap refuses at the threshold", () => {
  const reason = rejectBurstReason(4, 4, WINDOW);
  expect(reason).toMatch(/Reject burst/);
  expect(reason).toMatch(/4 rejected/);
  expect(reason).toMatch(/max 4/);
});

test("rows outside the window do not count", () => {
  const seen = [
    ...rejects(4, "BTC/USDT", WINDOW + 1),
    order({ id: "fresh", status: "rejected", timestamp: NOW - 500 }),
  ];
  expect(rejectedCountInWindow(seen, NOW, WINDOW)).toBe(1);
  expect(rejectBurstReason(1, 4, WINDOW)).toBeNull();
});

test("closed canceled and accepted rows do not count", () => {
  const seen = [
    order({ id: "c", status: "closed", timestamp: NOW - 1_000 }),
    order({ id: "x", status: "canceled", timestamp: NOW - 1_000 }),
    order({ id: "o", status: "open", timestamp: NOW - 1_000 }),
    order({ id: "f", status: "filled", timestamp: NOW - 1_000 }),
  ];
  expect(rejectedCountInWindow(seen, NOW, WINDOW)).toBe(0);
});

test("per-symbol cap ignores other pairs", () => {
  const seen = [...rejects(3, "ETH/USDT"), ...rejects(2, "BTC/USDT")];
  expect(rejectedCountInWindowForSymbol(seen, "BTC/USDT", NOW, WINDOW)).toBe(2);
  expect(rejectedCountInWindowForSymbol(seen, "ETH/USDT", NOW, WINDOW)).toBe(3);
  expect(rejectBurstPerSymbolReason("BTC/USDT", 2, 3, WINDOW)).toBeNull();
  const reason = rejectBurstPerSymbolReason("ETH/USDT", 3, 3, WINDOW);
  expect(reason).toMatch(/Reject burst \(ETH\/USDT\)/);
});

test("zero max or window disables the floor", () => {
  expect(rejectBurstReason(9, 0, WINDOW)).toBeNull();
  expect(rejectBurstPerSymbolReason("BTC/USDT", 9, 3, 0)).toBeNull();
  expect(rejectedCountInWindow(rejects(2), NOW, 0)).toBe(0);
});
