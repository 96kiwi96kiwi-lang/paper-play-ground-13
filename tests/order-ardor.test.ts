import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderArdorReason } from "@/lib/orders/order-ardor";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank ardor aliases pass", () => {
  expect(orderArdorReason(undefined)).toBeNull();
  expect(orderArdorReason(null, null, null)).toBeNull();
  expect(orderArdorReason(false, "", "  ")).toBeNull();
});

test("a present ardor alias is refused and does not halt", () => {
  expect(orderArdorReason("strong")).toBe(
    "Ardor is not supported; the adapter would place a plain spot order",
  );
  expect(orderArdorReason(0)).toBe(
    "Ardor is not supported; the adapter would place a plain spot order",
  );
  expect(orderArdorReason(undefined, "ardor-1")).toBe(
    "Ardor id is not supported; the adapter would place a plain spot order",
  );
  expect(orderArdorReason(undefined, undefined, true)).toBe(
    "Order-ardor alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-ardor floor", () => {
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
    ["ardor", "Ardor is not supported; the adapter would place a plain spot order"],
    ["ardorId", "Ardor id is not supported; the adapter would place a plain spot order"],
    ["orderArdor", "Order-ardor alias is not supported; the adapter would place a plain spot order"],
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
