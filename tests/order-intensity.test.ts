import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderIntensityReason } from "@/lib/orders/order-intensity";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank intensity aliases pass", () => {
  expect(orderIntensityReason(undefined)).toBeNull();
  expect(orderIntensityReason(null, null, null)).toBeNull();
  expect(orderIntensityReason(false, "", "  ")).toBeNull();
});

test("a present intensity alias is refused and does not halt", () => {
  expect(orderIntensityReason("high")).toBe(
    "Intensity is not supported; the adapter would place a plain spot order",
  );
  expect(orderIntensityReason(0)).toBe(
    "Intensity is not supported; the adapter would place a plain spot order",
  );
  expect(orderIntensityReason(undefined, "intensity-1")).toBe(
    "Intensity id is not supported; the adapter would place a plain spot order",
  );
  expect(orderIntensityReason(undefined, undefined, true)).toBe(
    "Order-intensity alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-intensity floor", () => {
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
    ["intensity", "Intensity is not supported; the adapter would place a plain spot order"],
    ["intensityId", "Intensity id is not supported; the adapter would place a plain spot order"],
    ["orderIntensity", "Order-intensity alias is not supported; the adapter would place a plain spot order"],
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
