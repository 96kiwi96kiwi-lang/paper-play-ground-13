import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderFaithReason } from "@/lib/orders/order-faith";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank faith aliases pass", () => {
  expect(orderFaithReason(undefined)).toBeNull();
  expect(orderFaithReason(null, null, null)).toBeNull();
  expect(orderFaithReason(false, "", "  ")).toBeNull();
});

test("a present faith alias is refused and does not halt", () => {
  expect(orderFaithReason("strong")).toBe(
    "Faith is not supported; the adapter would place a plain spot order",
  );
  expect(orderFaithReason(0)).toBe(
    "Faith is not supported; the adapter would place a plain spot order",
  );
  expect(orderFaithReason(undefined, "faith-1")).toBe(
    "Faith id is not supported; the adapter would place a plain spot order",
  );
  expect(orderFaithReason(undefined, undefined, true)).toBe(
    "Order-faith alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-faith floor", () => {
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
    ["faith", "Faith is not supported; the adapter would place a plain spot order"],
    ["faithId", "Faith id is not supported; the adapter would place a plain spot order"],
    ["orderFaith", "Order-faith alias is not supported; the adapter would place a plain spot order"],
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
