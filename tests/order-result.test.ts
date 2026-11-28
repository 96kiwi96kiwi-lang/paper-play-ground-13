import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderResultReason } from "@/lib/orders/order-result";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank result aliases pass", () => {
  expect(orderResultReason(undefined)).toBeNull();
  expect(orderResultReason(null, null, null)).toBeNull();
  expect(orderResultReason(false, "", "  ")).toBeNull();
});

test("a present result alias is refused and does not halt", () => {
  expect(orderResultReason("filled")).toBe(
    "Result is not supported; the adapter would place a plain spot order",
  );
  expect(orderResultReason(0)).toBe(
    "Result is not supported; the adapter would place a plain spot order",
  );
  expect(orderResultReason(undefined, "result-1")).toBe(
    "Result id is not supported; the adapter would place a plain spot order",
  );
  expect(orderResultReason(undefined, undefined, true)).toBe(
    "Order-result alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-result floor", () => {
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
    ["result", "Result is not supported; the adapter would place a plain spot order"],
    ["resultId", "Result id is not supported; the adapter would place a plain spot order"],
    ["orderResult", "Order-result alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "filled",
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
