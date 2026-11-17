import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderReviewReason } from "@/lib/orders/order-review";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank review aliases pass", () => {
  expect(orderReviewReason(undefined)).toBeNull();
  expect(orderReviewReason(null, null, null)).toBeNull();
  expect(orderReviewReason(false, "", "  ")).toBeNull();
});

test("a present review alias is refused and does not halt", () => {
  expect(orderReviewReason("hedge note")).toBe(
    "Order review is not supported; the adapter would place a plain spot order",
  );
  expect(orderReviewReason(0)).toBe(
    "Order review is not supported; the adapter would place a plain spot order",
  );
  expect(orderReviewReason(undefined, "client memo")).toBe(
    "Order review alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderReviewReason(undefined, undefined, true)).toBe(
    "Client review alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-review floor", () => {
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
    ["review", "Order review is not supported; the adapter would place a plain spot order"],
    ["orderReview", "Order review alias is not supported; the adapter would place a plain spot order"],
    ["clientReview", "Client review alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "desk",
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
