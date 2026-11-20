import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderWillReason } from "@/lib/orders/order-will";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank will aliases pass", () => {
  expect(orderWillReason(undefined)).toBeNull();
  expect(orderWillReason(null, null, null)).toBeNull();
  expect(orderWillReason(false, "", "  ")).toBeNull();
});

test("a present will alias is refused and does not halt", () => {
  expect(orderWillReason("accumulate")).toBe(
    "Will is not supported; the adapter would place a plain spot order",
  );
  expect(orderWillReason(0)).toBe(
    "Will is not supported; the adapter would place a plain spot order",
  );
  expect(orderWillReason(undefined, "will-1")).toBe(
    "Will id is not supported; the adapter would place a plain spot order",
  );
  expect(orderWillReason(undefined, undefined, true)).toBe(
    "Order-will alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-will floor", () => {
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
    ["will", "Will is not supported; the adapter would place a plain spot order"],
    ["willId", "Will id is not supported; the adapter would place a plain spot order"],
    ["orderWill", "Order-will alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "accumulate",
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
