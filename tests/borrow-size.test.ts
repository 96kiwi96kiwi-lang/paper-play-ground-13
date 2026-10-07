import { expect, test } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { borrowSizeReason } from "@/lib/orders/borrow-size";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

function riskState(): RiskState {
  return {
    portfolioValue: 10_000,
    cash: 10_000,
    openPositionsCount: 0,
    dailyPnlPct: 0,
    drawdownPct: 0,
    losingStreak: 0,
    cooldownUntil: null,
    haltReason: null,
    tradesToday: 0,
    tradesDayKey: new Date().toISOString().slice(0, 10),
  };
}

test("omitted, blank, and false pass", () => {
  expect(borrowSizeReason(undefined)).toBeNull();
  expect(borrowSizeReason(null, null, null)).toBeNull();
  expect(borrowSizeReason("", "  ", false)).toBeNull();
  expect(borrowSizeReason(false, false, false)).toBeNull();
});

test("a present borrow size is refused and does not halt", () => {
  expect(borrowSizeReason(0.5)).toBe(
    "Borrow amount is not supported; the adapter places the base size on the spot book",
  );
  expect(borrowSizeReason(0)).toBe(
    "Borrow amount is not supported; the adapter places the base size on the spot book",
  );
  expect(borrowSizeReason(undefined, "0.25")).toBe(
    "Borrow size is not supported; the adapter places the base size on the spot book",
  );
  expect(borrowSizeReason(undefined, undefined, 10)).toBe(
    "Loan amount is not supported; the adapter places the base size on the spot book",
  );
  expect(borrowSizeReason(undefined, undefined, true)).toBe(
    "Loan amount is not supported; the adapter places the base size on the spot book",
  );
});

test.each([
  ["borrowAmount", 0.5, "Borrow amount"],
  ["borrowSize", "0.25", "Borrow size"],
  ["loanAmount", 10, "Loan amount"],
] as const)(
  "OrderManager refuses %s before the adapter",
  async (field, value, label) => {
    let submits = 0;
    const adapter = {
      name: "paper" as const,
      placeMarketOrder: async () => {
        submits += 1;
        throw new Error("adapter must not be reached");
      },
    } as unknown as ExchangeAdapter;
    const manager = new OrderManager(adapter);

    const result = await manager.submit(
      {
        symbol: "BTC/USDT",
        side: "buy",
        amount: 0.001,
        type: "market",
        quotedAt: Date.now(),
        [field]: value,
      },
      riskState(),
    );

    expect(result).toEqual({
      ok: false,
      reason: `${label} is not supported; the adapter places the base size on the spot book`,
    });
    expect(submits).toBe(0);
    expect(manager.seenOrders()).toHaveLength(0);
  },
);
