import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderQuestReason } from "@/lib/orders/order-quest";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank quest aliases pass", () => {
  expect(orderQuestReason(undefined)).toBeNull();
  expect(orderQuestReason(null, null, null)).toBeNull();
  expect(orderQuestReason(false, "", "  ")).toBeNull();
});

test("a present quest alias is refused and does not halt", () => {
  expect(orderQuestReason("grid-quest")).toBe(
    "Quest is not supported; the adapter would place a plain spot order",
  );
  expect(orderQuestReason(0)).toBe(
    "Quest is not supported; the adapter would place a plain spot order",
  );
  expect(orderQuestReason(undefined, "quest-7")).toBe(
    "Quest id is not supported; the adapter would place a plain spot order",
  );
  expect(orderQuestReason(undefined, undefined, true)).toBe(
    "Client quest is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-quest floor", () => {
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
    ["quest", "Quest is not supported; the adapter would place a plain spot order"],
    ["questId", "Quest id is not supported; the adapter would place a plain spot order"],
    ["clientQuest", "Client quest is not supported; the adapter would place a plain spot order"],
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
        [field]: "quest-7",
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
