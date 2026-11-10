import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderAnnotationReason } from "@/lib/orders/order-annotation";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, blank, and false pass", () => {
  expect(orderAnnotationReason(undefined)).toBeNull();
  expect(orderAnnotationReason(null, null, null)).toBeNull();
  expect(orderAnnotationReason("", "  ", false)).toBeNull();
  expect(orderAnnotationReason(false, false, false)).toBeNull();
});

test("a present annotation is refused and does not halt", () => {
  expect(orderAnnotationReason("grid-ann")).toBe(
    "Order annotation is not supported; the adapter would place a plain spot order",
  );
  expect(orderAnnotationReason(0)).toBe(
    "Order annotation is not supported; the adapter would place a plain spot order",
  );
  expect(orderAnnotationReason(undefined, "bybit-ann")).toBe(
    "Order annotation alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderAnnotationReason(undefined, undefined, "client-ann")).toBe(
    "Client annotation alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderAnnotationReason(undefined, undefined, true)).toBe(
    "Client annotation alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-annotation floor", () => {
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
    ["annotation", "Order annotation is not supported; the adapter would place a plain spot order"],
    ["orderAnnotation", "Order annotation alias is not supported; the adapter would place a plain spot order"],
    ["clientAnnotation", "Client annotation alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "desk-ann",
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
