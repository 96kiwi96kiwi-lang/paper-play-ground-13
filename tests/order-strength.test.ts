import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderStrengthReason } from "@/lib/orders/order-strength";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank strength aliases pass", () => {
  expect(orderStrengthReason(undefined)).toBeNull();
  expect(orderStrengthReason(null, null, null)).toBeNull();
  expect(orderStrengthReason(false, "", "  ")).toBeNull();
});

test("a present strength alias is refused and does not halt", () => {
  expect(orderStrengthReason("high")).toBe(
    "Strength is not supported; the adapter would place a plain spot order",
  );
  expect(orderStrengthReason(0)).toBe(
    "Strength is not supported; the adapter would place a plain spot order",
  );
  expect(orderStrengthReason(undefined, "strength-1")).toBe(
    "Strength id is not supported; the adapter would place a plain spot order",
  );
  expect(orderStrengthReason(undefined, undefined, true)).toBe(
    "Order-strength alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-strength floor", () => {
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
    ["strength", "Strength is not supported; the adapter would place a plain spot order"],
    ["strengthId", "Strength id is not supported; the adapter would place a plain spot order"],
    ["orderStrength", "Order-strength alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "high",
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
