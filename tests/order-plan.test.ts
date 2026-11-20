import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderPlanReason } from "@/lib/orders/order-plan";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank plan aliases pass", () => {
  expect(orderPlanReason(undefined)).toBeNull();
  expect(orderPlanReason(null, null, null)).toBeNull();
  expect(orderPlanReason(false, "", "  ")).toBeNull();
});

test("a present plan alias is refused and does not halt", () => {
  expect(orderPlanReason("grid-plan")).toBe(
    "Plan is not supported; the adapter would place a plain spot order",
  );
  expect(orderPlanReason(0)).toBe(
    "Plan is not supported; the adapter would place a plain spot order",
  );
  expect(orderPlanReason(undefined, "plan-7")).toBe(
    "Plan id is not supported; the adapter would place a plain spot order",
  );
  expect(orderPlanReason(undefined, undefined, true)).toBe(
    "Client plan is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-plan floor", () => {
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
    ["plan", "Plan is not supported; the adapter would place a plain spot order"],
    ["planId", "Plan id is not supported; the adapter would place a plain spot order"],
    ["clientPlan", "Client plan is not supported; the adapter would place a plain spot order"],
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
        [field]: "plan-7",
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
