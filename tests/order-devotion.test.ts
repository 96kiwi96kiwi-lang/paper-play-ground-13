import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderDevotionReason } from "@/lib/orders/order-devotion";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank devotion aliases pass", () => {
  expect(orderDevotionReason(undefined)).toBeNull();
  expect(orderDevotionReason(null, null, null)).toBeNull();
  expect(orderDevotionReason(false, "", "  ")).toBeNull();
});

test("a present devotion alias is refused and does not halt", () => {
  expect(orderDevotionReason("strong")).toBe(
    "Devotion is not supported; the adapter would place a plain spot order",
  );
  expect(orderDevotionReason(0)).toBe(
    "Devotion is not supported; the adapter would place a plain spot order",
  );
  expect(orderDevotionReason(undefined, "devotion-1")).toBe(
    "Devotion id is not supported; the adapter would place a plain spot order",
  );
  expect(orderDevotionReason(undefined, undefined, true)).toBe(
    "Order-devotion alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-devotion floor", () => {
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
    ["devotion", "Devotion is not supported; the adapter would place a plain spot order"],
    ["devotionId", "Devotion id is not supported; the adapter would place a plain spot order"],
    ["orderDevotion", "Order-devotion alias is not supported; the adapter would place a plain spot order"],
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
