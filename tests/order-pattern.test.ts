import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderPatternReason } from "@/lib/orders/order-pattern";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank pattern aliases pass", () => {
  expect(orderPatternReason()).toBeNull();
  expect(orderPatternReason(undefined, undefined, undefined)).toBeNull();
  expect(orderPatternReason(null, null, null)).toBeNull();
  expect(orderPatternReason(false, false, false)).toBeNull();
  expect(orderPatternReason("", "  ", "")).toBeNull();
});

test("a present pattern alias is refused and does not halt", () => {
  expect(orderPatternReason("repeating")).toBe(
    "Order pattern is not supported; the adapter would place a plain spot order",
  );
  expect(orderPatternReason(1)).toBe(
    "Order pattern is not supported; the adapter would place a plain spot order",
  );
  expect(orderPatternReason(undefined, "grid")).toBe(
    "Order pattern alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderPatternReason(undefined, undefined, "custom")).toBe(
    "Client pattern alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-pattern floor", () => {
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
    ["pattern", "Order pattern is not supported; the adapter would place a plain spot order"],
    ["orderPattern", "Order pattern alias is not supported; the adapter would place a plain spot order"],
    ["clientPattern", "Client pattern alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "repeating",
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
