import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderResolveReason } from "@/lib/orders/order-resolve";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank resolve aliases pass", () => {
  expect(orderResolveReason(undefined)).toBeNull();
  expect(orderResolveReason(null, null, null)).toBeNull();
  expect(orderResolveReason(false, "", "  ")).toBeNull();
});

test("a present resolve alias is refused and does not halt", () => {
  expect(orderResolveReason("high")).toBe(
    "Resolve is not supported; the adapter would place a plain spot order",
  );
  expect(orderResolveReason(0)).toBe(
    "Resolve is not supported; the adapter would place a plain spot order",
  );
  expect(orderResolveReason(undefined, "resolve-1")).toBe(
    "Resolve id is not supported; the adapter would place a plain spot order",
  );
  expect(orderResolveReason(undefined, undefined, true)).toBe(
    "Order-resolve alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-resolve floor", () => {
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
    ["resolve", "Resolve is not supported; the adapter would place a plain spot order"],
    ["resolveId", "Resolve id is not supported; the adapter would place a plain spot order"],
    ["orderResolve", "Order-resolve alias is not supported; the adapter would place a plain spot order"],
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
