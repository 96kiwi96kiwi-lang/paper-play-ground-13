import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderPassionReason } from "@/lib/orders/order-passion";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank passion aliases pass", () => {
  expect(orderPassionReason(undefined)).toBeNull();
  expect(orderPassionReason(null, null, null)).toBeNull();
  expect(orderPassionReason(false, "", "  ")).toBeNull();
});

test("a present passion alias is refused and does not halt", () => {
  expect(orderPassionReason("strong")).toBe(
    "Passion is not supported; the adapter would place a plain spot order",
  );
  expect(orderPassionReason(0)).toBe(
    "Passion is not supported; the adapter would place a plain spot order",
  );
  expect(orderPassionReason(undefined, "passion-1")).toBe(
    "Passion id is not supported; the adapter would place a plain spot order",
  );
  expect(orderPassionReason(undefined, undefined, true)).toBe(
    "Order-passion alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-passion floor", () => {
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
    ["passion", "Passion is not supported; the adapter would place a plain spot order"],
    ["passionId", "Passion id is not supported; the adapter would place a plain spot order"],
    ["orderPassion", "Order-passion alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "strong",
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
