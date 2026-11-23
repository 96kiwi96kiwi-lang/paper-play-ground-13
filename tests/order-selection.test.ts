import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderSelectionReason } from "@/lib/orders/order-selection";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank selection aliases pass", () => {
  expect(orderSelectionReason(undefined)).toBeNull();
  expect(orderSelectionReason(null, null, null)).toBeNull();
  expect(orderSelectionReason(false, "", "  ")).toBeNull();
});

test("a present selection alias is refused and does not halt", () => {
  expect(orderSelectionReason("prefer")).toBe(
    "Selection is not supported; the adapter would place a plain spot order",
  );
  expect(orderSelectionReason(0)).toBe(
    "Selection is not supported; the adapter would place a plain spot order",
  );
  expect(orderSelectionReason(undefined, "selection-1")).toBe(
    "Selection id is not supported; the adapter would place a plain spot order",
  );
  expect(orderSelectionReason(undefined, undefined, true)).toBe(
    "Order-selection alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-selection floor", () => {
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
    ["selection", "Selection is not supported; the adapter would place a plain spot order"],
    ["selectionId", "Selection id is not supported; the adapter would place a plain spot order"],
    ["orderSelection", "Order-selection alias is not supported; the adapter would place a plain spot order"],
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
