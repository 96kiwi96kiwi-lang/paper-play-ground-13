import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderGoalReason } from "@/lib/orders/order-goal";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank goal aliases pass", () => {
  expect(orderGoalReason(undefined)).toBeNull();
  expect(orderGoalReason(null, null, null)).toBeNull();
  expect(orderGoalReason(false, "", "  ")).toBeNull();
});

test("a present goal alias is refused and does not halt", () => {
  expect(orderGoalReason("grid-goal")).toBe(
    "Goal is not supported; the adapter would place a plain spot order",
  );
  expect(orderGoalReason(0)).toBe(
    "Goal is not supported; the adapter would place a plain spot order",
  );
  expect(orderGoalReason(undefined, "goal-7")).toBe(
    "Goal id is not supported; the adapter would place a plain spot order",
  );
  expect(orderGoalReason(undefined, undefined, true)).toBe(
    "Client goal is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-goal floor", () => {
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
    ["goal", "Goal is not supported; the adapter would place a plain spot order"],
    ["goalId", "Goal id is not supported; the adapter would place a plain spot order"],
    ["clientGoal", "Client goal is not supported; the adapter would place a plain spot order"],
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
        [field]: "goal-7",
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
