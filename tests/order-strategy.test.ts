import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderStrategyReason } from "@/lib/orders/order-strategy";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank strategy aliases pass", () => {
  expect(orderStrategyReason(undefined)).toBeNull();
  expect(orderStrategyReason(null, null, null)).toBeNull();
  expect(orderStrategyReason(false, "", "  ")).toBeNull();
});

test("a present strategy alias is refused and does not halt", () => {
  expect(orderStrategyReason("grid-v1")).toBe(
    "Strategy is not supported; the adapter would place a plain spot order",
  );
  expect(orderStrategyReason(0)).toBe(
    "Strategy is not supported; the adapter would place a plain spot order",
  );
  expect(orderStrategyReason(undefined, "strat-42")).toBe(
    "Strategy id is not supported; the adapter would place a plain spot order",
  );
  expect(orderStrategyReason(undefined, undefined, true)).toBe(
    "Client strategy is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-strategy floor", () => {
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
    ["strategy", "Strategy is not supported; the adapter would place a plain spot order"],
    ["strategyId", "Strategy id is not supported; the adapter would place a plain spot order"],
    ["clientStrategy", "Client strategy is not supported; the adapter would place a plain spot order"],
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
        [field]: "strat-42",
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
