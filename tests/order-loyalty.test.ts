import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderLoyaltyReason } from "@/lib/orders/order-loyalty";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank loyalty aliases pass", () => {
  expect(orderLoyaltyReason(undefined)).toBeNull();
  expect(orderLoyaltyReason(null, null, null)).toBeNull();
  expect(orderLoyaltyReason(false, "", "  ")).toBeNull();
});

test("a present loyalty alias is refused and does not halt", () => {
  expect(orderLoyaltyReason("strong")).toBe(
    "Loyalty is not supported; the adapter would place a plain spot order",
  );
  expect(orderLoyaltyReason(0)).toBe(
    "Loyalty is not supported; the adapter would place a plain spot order",
  );
  expect(orderLoyaltyReason(undefined, "loyalty-1")).toBe(
    "Loyalty id is not supported; the adapter would place a plain spot order",
  );
  expect(orderLoyaltyReason(undefined, undefined, true)).toBe(
    "Order-loyalty alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-loyalty floor", () => {
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
    ["loyalty", "Loyalty is not supported; the adapter would place a plain spot order"],
    ["loyaltyId", "Loyalty id is not supported; the adapter would place a plain spot order"],
    ["orderLoyalty", "Order-loyalty alias is not supported; the adapter would place a plain spot order"],
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
