import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderIntentReason } from "@/lib/orders/order-intent";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank intent aliases pass", () => {
  expect(orderIntentReason(undefined)).toBeNull();
  expect(orderIntentReason(null, null, null)).toBeNull();
  expect(orderIntentReason(false, "", "  ")).toBeNull();
});

test("a present intent alias is refused and does not halt", () => {
  expect(orderIntentReason("buy-low")).toBe(
    "Intent is not supported; the adapter would place a plain spot order",
  );
  expect(orderIntentReason(0)).toBe(
    "Intent is not supported; the adapter would place a plain spot order",
  );
  expect(orderIntentReason(undefined, "goal-1")).toBe(
    "Intent id is not supported; the adapter would place a plain spot order",
  );
  expect(orderIntentReason(undefined, undefined, true)).toBe(
    "Order-intent alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-intent floor", () => {
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
    ["intent", "Intent is not supported; the adapter would place a plain spot order"],
    ["intentId", "Intent id is not supported; the adapter would place a plain spot order"],
    ["orderIntent", "Order-intent alias is not supported; the adapter would place a plain spot order"],
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
