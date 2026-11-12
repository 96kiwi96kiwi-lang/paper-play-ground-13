import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderGradeReason } from "@/lib/orders/order-grade";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank grade aliases pass", () => {
  expect(orderGradeReason(undefined)).toBeNull();
  expect(orderGradeReason(null, null, null)).toBeNull();
  expect(orderGradeReason(false, "", "  ")).toBeNull();
});

test("a present grade alias is refused and does not halt", () => {
  expect(orderGradeReason("A")).toBe(
    "Grade is not supported; the adapter would place a plain spot order",
  );
  expect(orderGradeReason(1)).toBe(
    "Grade is not supported; the adapter would place a plain spot order",
  );
  expect(orderGradeReason(undefined, "top")).toBe(
    "Order grade is not supported; the adapter would place a plain spot order",
  );
  expect(orderGradeReason(undefined, undefined, true)).toBe(
    "Client grade is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-grade floor", () => {
  const riskState: RiskState = {
    portfolioValue: 10_000,
    cash: 10_000,
    openPositionsCount: 0,
    dailyPnlPct: 0,
    drawdownPct: 0,
    losingStreak: 0,
    cooldownUntil: null,
    haltReason: null,
  };

  it.each([
    ["grade", "Grade is not supported; the adapter would place a plain spot order"],
    ["orderGrade", "Order grade is not supported; the adapter would place a plain spot order"],
    ["clientGrade", "Client grade is not supported; the adapter would place a plain spot order"],
  ] as const)("refuses a present %s before the adapter", async (field, reason) => {
    const placeMarketOrder = vi.fn();
    const placeLimitOrder = vi.fn();
    const adapter = {
      name: "paper",
      placeMarketOrder,
      placeLimitOrder,
    } as unknown as ExchangeAdapter;
    const manager = new OrderManager(adapter);

    const result = await manager.submit(
      {
        symbol: "BTC/USDT",
        side: "buy",
        amount: 0.01,
        type: "market",
        [field]: "A",
      },
      riskState,
    );

    expect(result.ok).toBe(false);
    expect(result.reason).toBe(reason);
    expect(placeMarketOrder).not.toHaveBeenCalled();
    expect(placeLimitOrder).not.toHaveBeenCalled();
    expect(manager.seenOrders()).toEqual([]);
    expect(riskState.haltReason).toBeNull();
  });
});
