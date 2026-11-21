import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderOptimismReason } from "@/lib/orders/order-optimism";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank optimism aliases pass", () => {
  expect(orderOptimismReason(undefined)).toBeNull();
  expect(orderOptimismReason(null, null, null)).toBeNull();
  expect(orderOptimismReason(false, "", "  ")).toBeNull();
});

test("a present optimism alias is refused and does not halt", () => {
  expect(orderOptimismReason("accumulate")).toBe(
    "Optimism is not supported; the adapter would place a plain spot order",
  );
  expect(orderOptimismReason(0)).toBe(
    "Optimism is not supported; the adapter would place a plain spot order",
  );
  expect(orderOptimismReason(undefined, "optimism-1")).toBe(
    "Optimism id is not supported; the adapter would place a plain spot order",
  );
  expect(orderOptimismReason(undefined, undefined, true)).toBe(
    "Order-optimism alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-optimism floor", () => {
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
    ["optimism", "Optimism is not supported; the adapter would place a plain spot order"],
    ["optimismId", "Optimism id is not supported; the adapter would place a plain spot order"],
    ["orderOptimism", "Order-optimism alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "accumulate",
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
