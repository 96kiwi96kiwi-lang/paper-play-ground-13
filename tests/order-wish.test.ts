import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderWishReason } from "@/lib/orders/order-wish";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank wish aliases pass", () => {
  expect(orderWishReason(undefined)).toBeNull();
  expect(orderWishReason(null, null, null)).toBeNull();
  expect(orderWishReason(false, "", "  ")).toBeNull();
});

test("a present wish alias is refused and does not halt", () => {
  expect(orderWishReason("accumulate")).toBe(
    "Wish is not supported; the adapter would place a plain spot order",
  );
  expect(orderWishReason(0)).toBe(
    "Wish is not supported; the adapter would place a plain spot order",
  );
  expect(orderWishReason(undefined, "wish-1")).toBe(
    "Wish id is not supported; the adapter would place a plain spot order",
  );
  expect(orderWishReason(undefined, undefined, true)).toBe(
    "Order-wish alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-wish floor", () => {
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
    ["wish", "Wish is not supported; the adapter would place a plain spot order"],
    ["wishId", "Wish id is not supported; the adapter would place a plain spot order"],
    ["orderWish", "Order-wish alias is not supported; the adapter would place a plain spot order"],
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
