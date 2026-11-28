import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderShapeReason } from "@/lib/orders/order-shape";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank shape aliases pass", () => {
  expect(orderShapeReason()).toBeNull();
  expect(orderShapeReason(undefined, undefined, undefined)).toBeNull();
  expect(orderShapeReason(null, null, null)).toBeNull();
  expect(orderShapeReason(false, false, false)).toBeNull();
  expect(orderShapeReason("", "  ", "")).toBeNull();
});

test("a present shape alias is refused and does not halt", () => {
  expect(orderShapeReason("iceberg")).toBe(
    "Order shape is not supported; the adapter would place a plain spot order",
  );
  expect(orderShapeReason(1)).toBe(
    "Order shape is not supported; the adapter would place a plain spot order",
  );
  expect(orderShapeReason(undefined, "grid")).toBe(
    "Order shape alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderShapeReason(undefined, undefined, "custom")).toBe(
    "Client shape alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-shape floor", () => {
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
    ["shape", "Order shape is not supported; the adapter would place a plain spot order"],
    ["orderShape", "Order shape alias is not supported; the adapter would place a plain spot order"],
    ["clientShape", "Client shape alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "iceberg",
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
