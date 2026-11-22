import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderMightReason } from "@/lib/orders/order-might";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank might aliases pass", () => {
  expect(orderMightReason(undefined)).toBeNull();
  expect(orderMightReason(null, null, null)).toBeNull();
  expect(orderMightReason(false, "", "  ")).toBeNull();
});

test("a present might alias is refused and does not halt", () => {
  expect(orderMightReason("high")).toBe(
    "Might is not supported; the adapter would place a plain spot order",
  );
  expect(orderMightReason(0)).toBe(
    "Might is not supported; the adapter would place a plain spot order",
  );
  expect(orderMightReason(undefined, "might-1")).toBe(
    "Might id is not supported; the adapter would place a plain spot order",
  );
  expect(orderMightReason(undefined, undefined, true)).toBe(
    "Order-might alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-might floor", () => {
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
    ["might", "Might is not supported; the adapter would place a plain spot order"],
    ["mightId", "Might id is not supported; the adapter would place a plain spot order"],
    ["orderMight", "Order-might alias is not supported; the adapter would place a plain spot order"],
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
