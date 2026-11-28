import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderFrameworkReason } from "@/lib/orders/order-framework";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank framework aliases pass", () => {
  expect(orderFrameworkReason()).toBeNull();
  expect(orderFrameworkReason(undefined, undefined, undefined)).toBeNull();
  expect(orderFrameworkReason(null, null, null)).toBeNull();
  expect(orderFrameworkReason(false, false, false)).toBeNull();
  expect(orderFrameworkReason("", "  ", "")).toBeNull();
});

test("a present framework alias is refused and does not halt", () => {
  expect(orderFrameworkReason("iceberg")).toBe(
    "Order framework is not supported; the adapter would place a plain spot order",
  );
  expect(orderFrameworkReason(1)).toBe(
    "Order framework is not supported; the adapter would place a plain spot order",
  );
  expect(orderFrameworkReason(undefined, "grid")).toBe(
    "Order framework alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderFrameworkReason(undefined, undefined, "custom")).toBe(
    "Client framework alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-framework floor", () => {
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
    ["framework", "Order framework is not supported; the adapter would place a plain spot order"],
    ["orderFramework", "Order framework alias is not supported; the adapter would place a plain spot order"],
    ["clientFramework", "Client framework alias is not supported; the adapter would place a plain spot order"],
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
