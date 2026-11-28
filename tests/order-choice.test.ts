import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderChoiceReason } from "@/lib/orders/order-choice";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank choice aliases pass", () => {
  expect(orderChoiceReason(undefined)).toBeNull();
  expect(orderChoiceReason(null, null, null)).toBeNull();
  expect(orderChoiceReason(false, "", "  ")).toBeNull();
});

test("a present choice alias is refused and does not halt", () => {
  expect(orderChoiceReason("prefer")).toBe(
    "Choice is not supported; the adapter would place a plain spot order",
  );
  expect(orderChoiceReason(0)).toBe(
    "Choice is not supported; the adapter would place a plain spot order",
  );
  expect(orderChoiceReason(undefined, "choice-1")).toBe(
    "Choice id is not supported; the adapter would place a plain spot order",
  );
  expect(orderChoiceReason(undefined, undefined, true)).toBe(
    "Order-choice alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-choice floor", () => {
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
    ["choice", "Choice is not supported; the adapter would place a plain spot order"],
    ["choiceId", "Choice id is not supported; the adapter would place a plain spot order"],
    ["orderChoice", "Order-choice alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "prefer",
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
