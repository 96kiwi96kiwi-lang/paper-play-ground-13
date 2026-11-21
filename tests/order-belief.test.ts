import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderBeliefReason } from "@/lib/orders/order-belief";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank belief aliases pass", () => {
  expect(orderBeliefReason(undefined)).toBeNull();
  expect(orderBeliefReason(null, null, null)).toBeNull();
  expect(orderBeliefReason(false, "", "  ")).toBeNull();
});

test("a present belief alias is refused and does not halt", () => {
  expect(orderBeliefReason("strong")).toBe(
    "Belief is not supported; the adapter would place a plain spot order",
  );
  expect(orderBeliefReason(0)).toBe(
    "Belief is not supported; the adapter would place a plain spot order",
  );
  expect(orderBeliefReason(undefined, "belief-1")).toBe(
    "Belief id is not supported; the adapter would place a plain spot order",
  );
  expect(orderBeliefReason(undefined, undefined, true)).toBe(
    "Order-belief alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-belief floor", () => {
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
    ["belief", "Belief is not supported; the adapter would place a plain spot order"],
    ["beliefId", "Belief id is not supported; the adapter would place a plain spot order"],
    ["orderBelief", "Order-belief alias is not supported; the adapter would place a plain spot order"],
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
