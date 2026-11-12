import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderSummaryReason } from "@/lib/orders/order-summary";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank summary aliases pass", () => {
  expect(orderSummaryReason(undefined)).toBeNull();
  expect(orderSummaryReason(null, null, null)).toBeNull();
  expect(orderSummaryReason(false, "", "  ")).toBeNull();
});

test("a present summary alias is refused and does not halt", () => {
  expect(orderSummaryReason("hedge note")).toBe(
    "Order summary is not supported; the adapter would place a plain spot order",
  );
  expect(orderSummaryReason(0)).toBe(
    "Order summary is not supported; the adapter would place a plain spot order",
  );
  expect(orderSummaryReason(undefined, "client memo")).toBe(
    "Order summary alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderSummaryReason(undefined, undefined, true)).toBe(
    "Client summary alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-summary floor", () => {
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
    ["summary", "Order summary is not supported; the adapter would place a plain spot order"],
    ["orderSummary", "Order summary alias is not supported; the adapter would place a plain spot order"],
    ["clientSummary", "Client summary alias is not supported; the adapter would place a plain spot order"],
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
