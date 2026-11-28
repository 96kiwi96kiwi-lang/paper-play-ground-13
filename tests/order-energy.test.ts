import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderEnergyReason } from "@/lib/orders/order-energy";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank energy aliases pass", () => {
  expect(orderEnergyReason(undefined)).toBeNull();
  expect(orderEnergyReason(null, null, null)).toBeNull();
  expect(orderEnergyReason(false, "", "  ")).toBeNull();
});

test("a present energy alias is refused and does not halt", () => {
  expect(orderEnergyReason("high")).toBe(
    "Energy is not supported; the adapter would place a plain spot order",
  );
  expect(orderEnergyReason(0)).toBe(
    "Energy is not supported; the adapter would place a plain spot order",
  );
  expect(orderEnergyReason(undefined, "energy-1")).toBe(
    "Energy id is not supported; the adapter would place a plain spot order",
  );
  expect(orderEnergyReason(undefined, undefined, true)).toBe(
    "Order-energy alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-energy floor", () => {
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
    ["energy", "Energy is not supported; the adapter would place a plain spot order"],
    ["energyId", "Energy id is not supported; the adapter would place a plain spot order"],
    ["orderEnergy", "Order-energy alias is not supported; the adapter would place a plain spot order"],
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
