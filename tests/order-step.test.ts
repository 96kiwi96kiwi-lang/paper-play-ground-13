import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderStepReason } from "@/lib/orders/order-step";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank step aliases pass", () => {
  expect(orderStepReason(undefined)).toBeNull();
  expect(orderStepReason(null, null, null)).toBeNull();
  expect(orderStepReason(false, "", "  ")).toBeNull();
});

test("a present step alias is refused and does not halt", () => {
  expect(orderStepReason("step-abc123")).toBe(
    "Step is not supported; the adapter would place a plain spot order",
  );
  expect(orderStepReason(0)).toBe(
    "Step is not supported; the adapter would place a plain spot order",
  );
  expect(orderStepReason(undefined, "ord-step")).toBe(
    "Order step is not supported; the adapter would place a plain spot order",
  );
  expect(orderStepReason(undefined, undefined, true)).toBe(
    "Client step is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-step floor", () => {
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
    ["step", "Step is not supported; the adapter would place a plain spot order"],
    ["orderStep", "Order step is not supported; the adapter would place a plain spot order"],
    ["clientStep", "Client step is not supported; the adapter would place a plain spot order"],
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
        [field]: "step-abc123",
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
