import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderDescriptionReason } from "@/lib/orders/order-description";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank description aliases pass", () => {
  expect(orderDescriptionReason(undefined)).toBeNull();
  expect(orderDescriptionReason(null, null, null)).toBeNull();
  expect(orderDescriptionReason(false, "", "  ")).toBeNull();
});

test("a present description alias is refused and does not halt", () => {
  expect(orderDescriptionReason("hedge note")).toBe(
    "Order description is not supported; the adapter would place a plain spot order",
  );
  expect(orderDescriptionReason(0)).toBe(
    "Order description is not supported; the adapter would place a plain spot order",
  );
  expect(orderDescriptionReason(undefined, "client memo")).toBe(
    "Order description alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderDescriptionReason(undefined, undefined, true)).toBe(
    "Client description alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-description floor", () => {
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
    ["description", "Order description is not supported; the adapter would place a plain spot order"],
    ["orderDescription", "Order description alias is not supported; the adapter would place a plain spot order"],
    ["clientDescription", "Client description alias is not supported; the adapter would place a plain spot order"],
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
