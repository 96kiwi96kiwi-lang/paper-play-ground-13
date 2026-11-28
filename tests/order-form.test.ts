import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderFormReason } from "@/lib/orders/order-form";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank form aliases pass", () => {
  expect(orderFormReason()).toBeNull();
  expect(orderFormReason(undefined, undefined, undefined)).toBeNull();
  expect(orderFormReason(null, null, null)).toBeNull();
  expect(orderFormReason(false, false, false)).toBeNull();
  expect(orderFormReason("", "  ", "")).toBeNull();
});

test("a present form alias is refused and does not halt", () => {
  expect(orderFormReason("iceberg")).toBe(
    "Order form is not supported; the adapter would place a plain spot order",
  );
  expect(orderFormReason(1)).toBe(
    "Order form is not supported; the adapter would place a plain spot order",
  );
  expect(orderFormReason(undefined, "grid")).toBe(
    "Order form alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderFormReason(undefined, undefined, "custom")).toBe(
    "Client form alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-form floor", () => {
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
    ["form", "Order form is not supported; the adapter would place a plain spot order"],
    ["orderForm", "Order form alias is not supported; the adapter would place a plain spot order"],
    ["clientForm", "Client form alias is not supported; the adapter would place a plain spot order"],
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
