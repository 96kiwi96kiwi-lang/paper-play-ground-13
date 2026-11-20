import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderStatusReason } from "@/lib/orders/order-status";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank status aliases pass", () => {
  expect(orderStatusReason(undefined)).toBeNull();
  expect(orderStatusReason(null, null, null)).toBeNull();
  expect(orderStatusReason(false, "", "  ")).toBeNull();
});

test("a present status alias is refused and does not halt", () => {
  expect(orderStatusReason("status-abc123")).toBe(
    "Status is not supported; the adapter would place a plain spot order",
  );
  expect(orderStatusReason(0)).toBe(
    "Status is not supported; the adapter would place a plain spot order",
  );
  expect(orderStatusReason(undefined, "ord-status")).toBe(
    "Order status is not supported; the adapter would place a plain spot order",
  );
  expect(orderStatusReason(undefined, undefined, true)).toBe(
    "Client status is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-status floor", () => {
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
    ["status", "Status is not supported; the adapter would place a plain spot order"],
    ["orderStatus", "Order status is not supported; the adapter would place a plain spot order"],
    ["clientStatus", "Client status is not supported; the adapter would place a plain spot order"],
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
        [field]: "status-abc123",
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
