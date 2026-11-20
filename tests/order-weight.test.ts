import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderWeightReason } from "@/lib/orders/order-weight";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, blank, and false pass", () => {
  expect(orderWeightReason(undefined)).toBeNull();
  expect(orderWeightReason(null, null, null)).toBeNull();
  expect(orderWeightReason("", "  ", false)).toBeNull();
  expect(orderWeightReason(false, false, false)).toBeNull();
});

test("a present weight is refused and does not halt", () => {
  expect(orderWeightReason("high")).toBe(
    "Order weight is not supported; the adapter would place a plain spot order",
  );
  expect(orderWeightReason(0)).toBe(
    "Order weight is not supported; the adapter would place a plain spot order",
  );
  expect(orderWeightReason(undefined, "medium")).toBe(
    "Order weight alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderWeightReason(undefined, undefined, "client-low")).toBe(
    "Client weight alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderWeightReason(undefined, undefined, true)).toBe(
    "Client weight alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-weight floor", () => {
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
    ["weight", "Order weight is not supported; the adapter would place a plain spot order"],
    ["orderWeight", "Order weight alias is not supported; the adapter would place a plain spot order"],
    ["clientWeight", "Client weight alias is not supported; the adapter would place a plain spot order"],
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
