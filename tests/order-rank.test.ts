import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderRankReason } from "@/lib/orders/order-rank";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank rank aliases pass", () => {
  expect(orderRankReason(undefined)).toBeNull();
  expect(orderRankReason(null, null, null)).toBeNull();
  expect(orderRankReason(false, "", "  ")).toBeNull();
});

test("a present rank alias is refused and does not halt", () => {
  expect(orderRankReason("top")).toBe(
    "Rank is not supported; the adapter would place a plain spot order",
  );
  expect(orderRankReason(1)).toBe(
    "Rank is not supported; the adapter would place a plain spot order",
  );
  expect(orderRankReason(undefined, "high")).toBe(
    "Order rank is not supported; the adapter would place a plain spot order",
  );
  expect(orderRankReason(undefined, undefined, true)).toBe(
    "Client rank is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-rank floor", () => {
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
    ["rank", "Rank is not supported; the adapter would place a plain spot order"],
    ["orderRank", "Order rank is not supported; the adapter would place a plain spot order"],
    ["clientRank", "Client rank is not supported; the adapter would place a plain spot order"],
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
        [field]: "top",
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
