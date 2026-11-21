import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderConvictionReason } from "@/lib/orders/order-conviction";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank conviction aliases pass", () => {
  expect(orderConvictionReason(undefined)).toBeNull();
  expect(orderConvictionReason(null, null, null)).toBeNull();
  expect(orderConvictionReason(false, "", "  ")).toBeNull();
});

test("a present conviction alias is refused and does not halt", () => {
  expect(orderConvictionReason("strong")).toBe(
    "Conviction is not supported; the adapter would place a plain spot order",
  );
  expect(orderConvictionReason(0)).toBe(
    "Conviction is not supported; the adapter would place a plain spot order",
  );
  expect(orderConvictionReason(undefined, "conviction-1")).toBe(
    "Conviction id is not supported; the adapter would place a plain spot order",
  );
  expect(orderConvictionReason(undefined, undefined, true)).toBe(
    "Order-conviction alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-conviction floor", () => {
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
    ["conviction", "Conviction is not supported; the adapter would place a plain spot order"],
    ["convictionId", "Conviction id is not supported; the adapter would place a plain spot order"],
    ["orderConviction", "Order-conviction alias is not supported; the adapter would place a plain spot order"],
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
