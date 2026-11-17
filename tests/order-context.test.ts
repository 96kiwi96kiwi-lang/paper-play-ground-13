import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderContextReason } from "@/lib/orders/order-context";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank context aliases pass", () => {
  expect(orderContextReason(undefined)).toBeNull();
  expect(orderContextReason(null, null, null)).toBeNull();
  expect(orderContextReason(false, "", "  ")).toBeNull();
});

test("a present context alias is refused and does not halt", () => {
  expect(orderContextReason("hedge note")).toBe(
    "Context is not supported; the adapter would place a plain spot order",
  );
  expect(orderContextReason(0)).toBe(
    "Context is not supported; the adapter would place a plain spot order",
  );
  expect(orderContextReason(undefined, "client memo")).toBe(
    "Order context is not supported; the adapter would place a plain spot order",
  );
  expect(orderContextReason(undefined, undefined, true)).toBe(
    "Client context is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-context floor", () => {
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
    ["context", "Context is not supported; the adapter would place a plain spot order"],
    ["orderContext", "Order context is not supported; the adapter would place a plain spot order"],
    ["clientContext", "Client context is not supported; the adapter would place a plain spot order"],
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
        [field]: "hedge note",
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
