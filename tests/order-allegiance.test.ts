import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderAllegianceReason } from "@/lib/orders/order-allegiance";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank allegiance aliases pass", () => {
  expect(orderAllegianceReason(undefined)).toBeNull();
  expect(orderAllegianceReason(null, null, null)).toBeNull();
  expect(orderAllegianceReason(false, "", "  ")).toBeNull();
});

test("a present allegiance alias is refused and does not halt", () => {
  expect(orderAllegianceReason("strong")).toBe(
    "Allegiance is not supported; the adapter would place a plain spot order",
  );
  expect(orderAllegianceReason(0)).toBe(
    "Allegiance is not supported; the adapter would place a plain spot order",
  );
  expect(orderAllegianceReason(undefined, "allegiance-1")).toBe(
    "Allegiance id is not supported; the adapter would place a plain spot order",
  );
  expect(orderAllegianceReason(undefined, undefined, true)).toBe(
    "Order-allegiance alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-allegiance floor", () => {
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
    ["allegiance", "Allegiance is not supported; the adapter would place a plain spot order"],
    ["allegianceId", "Allegiance id is not supported; the adapter would place a plain spot order"],
    ["orderAllegiance", "Order-allegiance alias is not supported; the adapter would place a plain spot order"],
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
