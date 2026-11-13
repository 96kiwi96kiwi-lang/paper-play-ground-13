import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderHeaderReason } from "@/lib/orders/order-header";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank header aliases pass", () => {
  expect(orderHeaderReason(undefined)).toBeNull();
  expect(orderHeaderReason(null, null, null)).toBeNull();
  expect(orderHeaderReason(false, "", "  ")).toBeNull();
});

test("a present header alias is refused and does not halt", () => {
  expect(orderHeaderReason("hedge note")).toBe(
    "Header is not supported; the adapter would place a plain spot order",
  );
  expect(orderHeaderReason(0)).toBe(
    "Header is not supported; the adapter would place a plain spot order",
  );
  expect(orderHeaderReason(undefined, "client memo")).toBe(
    "Order header is not supported; the adapter would place a plain spot order",
  );
  expect(orderHeaderReason(undefined, undefined, true)).toBe(
    "Client header is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-header floor", () => {
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
    ["header", "Header is not supported; the adapter would place a plain spot order"],
    ["orderHeader", "Order header is not supported; the adapter would place a plain spot order"],
    ["clientHeader", "Client header is not supported; the adapter would place a plain spot order"],
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
        [field]: "hedge note",
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
