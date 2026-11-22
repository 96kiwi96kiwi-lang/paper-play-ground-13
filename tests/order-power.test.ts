import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderPowerReason } from "@/lib/orders/order-power";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank power aliases pass", () => {
  expect(orderPowerReason(undefined)).toBeNull();
  expect(orderPowerReason(null, null, null)).toBeNull();
  expect(orderPowerReason(false, "", "  ")).toBeNull();
});

test("a present power alias is refused and does not halt", () => {
  expect(orderPowerReason("high")).toBe(
    "Power is not supported; the adapter would place a plain spot order",
  );
  expect(orderPowerReason(0)).toBe(
    "Power is not supported; the adapter would place a plain spot order",
  );
  expect(orderPowerReason(undefined, "power-1")).toBe(
    "Power id is not supported; the adapter would place a plain spot order",
  );
  expect(orderPowerReason(undefined, undefined, true)).toBe(
    "Order-power alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-power floor", () => {
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
    ["power", "Power is not supported; the adapter would place a plain spot order"],
    ["powerId", "Power id is not supported; the adapter would place a plain spot order"],
    ["orderPower", "Order-power alias is not supported; the adapter would place a plain spot order"],
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
