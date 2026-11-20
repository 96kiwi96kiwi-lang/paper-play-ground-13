import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderHopeReason } from "@/lib/orders/order-hope";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank hope aliases pass", () => {
  expect(orderHopeReason(undefined)).toBeNull();
  expect(orderHopeReason(null, null, null)).toBeNull();
  expect(orderHopeReason(false, "", "  ")).toBeNull();
});

test("a present hope alias is refused and does not halt", () => {
  expect(orderHopeReason("accumulate")).toBe(
    "Hope is not supported; the adapter would place a plain spot order",
  );
  expect(orderHopeReason(0)).toBe(
    "Hope is not supported; the adapter would place a plain spot order",
  );
  expect(orderHopeReason(undefined, "hope-1")).toBe(
    "Hope id is not supported; the adapter would place a plain spot order",
  );
  expect(orderHopeReason(undefined, undefined, true)).toBe(
    "Order-hope alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-hope floor", () => {
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
    ["hope", "Hope is not supported; the adapter would place a plain spot order"],
    ["hopeId", "Hope id is not supported; the adapter would place a plain spot order"],
    ["orderHope", "Order-hope alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "accumulate",
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
