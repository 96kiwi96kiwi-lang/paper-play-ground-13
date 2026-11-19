import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderStoryReason } from "@/lib/orders/order-story";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank story aliases pass", () => {
  expect(orderStoryReason(undefined)).toBeNull();
  expect(orderStoryReason(null, null, null)).toBeNull();
  expect(orderStoryReason(false, "", "  ")).toBeNull();
});

test("a present story alias is refused and does not halt", () => {
  expect(orderStoryReason("grid-story")).toBe(
    "Story is not supported; the adapter would place a plain spot order",
  );
  expect(orderStoryReason(0)).toBe(
    "Story is not supported; the adapter would place a plain spot order",
  );
  expect(orderStoryReason(undefined, "story-7")).toBe(
    "Story id is not supported; the adapter would place a plain spot order",
  );
  expect(orderStoryReason(undefined, undefined, true)).toBe(
    "Client story is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-story floor", () => {
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
    ["story", "Story is not supported; the adapter would place a plain spot order"],
    ["storyId", "Story id is not supported; the adapter would place a plain spot order"],
    ["clientStory", "Client story is not supported; the adapter would place a plain spot order"],
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
        [field]: "story-7",
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
