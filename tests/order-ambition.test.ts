import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderAmbitionReason } from "@/lib/orders/order-ambition";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank ambition aliases pass", () => {
  expect(orderAmbitionReason(undefined)).toBeNull();
  expect(orderAmbitionReason(null, null, null)).toBeNull();
  expect(orderAmbitionReason(false, "", "  ")).toBeNull();
});

test("a present ambition alias is refused and does not halt", () => {
  expect(orderAmbitionReason("vision")).toBe(
    "Ambition is not supported; the adapter would place a plain spot order",
  );
  expect(orderAmbitionReason(0)).toBe(
    "Ambition is not supported; the adapter would place a plain spot order",
  );
  expect(orderAmbitionReason(undefined, "ambition-1")).toBe(
    "Ambition id is not supported; the adapter would place a plain spot order",
  );
  expect(orderAmbitionReason(undefined, undefined, true)).toBe(
    "Order-ambition alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-ambition floor", () => {
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
    ["ambition", "Ambition is not supported; the adapter would place a plain spot order"],
    ["ambitionId", "Ambition id is not supported; the adapter would place a plain spot order"],
    ["orderAmbition", "Order-ambition alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "vision",
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
