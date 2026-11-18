import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderZoneReason } from "@/lib/orders/order-zone";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank zone aliases pass", () => {
  expect(orderZoneReason()).toBeNull();
  expect(orderZoneReason(undefined, undefined, undefined)).toBeNull();
  expect(orderZoneReason(null, null, null)).toBeNull();
  expect(orderZoneReason(false, false, false)).toBeNull();
  expect(orderZoneReason("", "  ", "")).toBeNull();
});

test("a present zone alias is refused and does not halt", () => {
  expect(orderZoneReason("utc")).toBe(
    "Order zone is not supported; the adapter would place a plain spot order",
  );
  expect(orderZoneReason(1)).toBe(
    "Order zone is not supported; the adapter would place a plain spot order",
  );
  expect(orderZoneReason(true)).toBe(
    "Order zone is not supported; the adapter would place a plain spot order",
  );
  expect(orderZoneReason(undefined, "session")).toBe(
    "Order zone alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderZoneReason(undefined, 0)).toBe(
    "Order zone alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderZoneReason(undefined, undefined, "desk")).toBe(
    "Client zone alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-zone floor", () => {
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
    ["zone", "Order zone is not supported; the adapter would place a plain spot order"],
    ["orderZone", "Order zone alias is not supported; the adapter would place a plain spot order"],
    ["clientZone", "Client zone alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "utc",
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
