import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderRatingReason } from "@/lib/orders/order-rating";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank rating aliases pass", () => {
  expect(orderRatingReason(undefined)).toBeNull();
  expect(orderRatingReason(null, null, null)).toBeNull();
  expect(orderRatingReason(false, "", "  ")).toBeNull();
});

test("a present rating alias is refused and does not halt", () => {
  expect(orderRatingReason("high")).toBe(
    "Rating is not supported; the adapter would place a plain spot order",
  );
  expect(orderRatingReason(1)).toBe(
    "Rating is not supported; the adapter would place a plain spot order",
  );
  expect(orderRatingReason(undefined, "top")).toBe(
    "Order rating is not supported; the adapter would place a plain spot order",
  );
  expect(orderRatingReason(undefined, undefined, true)).toBe(
    "Client rating is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-rating floor", () => {
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
    ["rating", "Rating is not supported; the adapter would place a plain spot order"],
    ["orderRating", "Order rating is not supported; the adapter would place a plain spot order"],
    ["clientRating", "Client rating is not supported; the adapter would place a plain spot order"],
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
