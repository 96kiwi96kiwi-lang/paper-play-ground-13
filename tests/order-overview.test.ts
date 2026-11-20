import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderOverviewReason } from "@/lib/orders/order-overview";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank overview aliases pass", () => {
  expect(orderOverviewReason(undefined)).toBeNull();
  expect(orderOverviewReason(null, null, null)).toBeNull();
  expect(orderOverviewReason(false, "", "  ")).toBeNull();
});

test("a present overview alias is refused and does not halt", () => {
  expect(orderOverviewReason("hedge note")).toBe(
    "Order overview is not supported; the adapter would place a plain spot order",
  );
  expect(orderOverviewReason(0)).toBe(
    "Order overview is not supported; the adapter would place a plain spot order",
  );
  expect(orderOverviewReason(undefined, "client memo")).toBe(
    "Order overview alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderOverviewReason(undefined, undefined, true)).toBe(
    "Client overview alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-overview floor", () => {
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
    ["overview", "Order overview is not supported; the adapter would place a plain spot order"],
    ["orderOverview", "Order overview alias is not supported; the adapter would place a plain spot order"],
    ["clientOverview", "Client overview alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "desk",
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
