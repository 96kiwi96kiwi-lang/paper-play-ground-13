import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderBatchReason } from "@/lib/orders/order-batch";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank batch aliases pass", () => {
  expect(orderBatchReason()).toBeNull();
  expect(orderBatchReason(undefined, undefined, undefined)).toBeNull();
  expect(orderBatchReason(null, null, null)).toBeNull();
  expect(orderBatchReason(false, false, false)).toBeNull();
  expect(orderBatchReason("", "  ", "")).toBeNull();
});

test("a present batch alias is refused and does not halt", () => {
  expect(orderBatchReason("group-1")).toBe(
    "Batch is not supported; the adapter would place a plain spot order",
  );
  expect(orderBatchReason(0)).toBe(
    "Batch is not supported; the adapter would place a plain spot order",
  );
  expect(orderBatchReason(undefined, "batch-a")).toBe(
    "Order batch is not supported; the adapter would place a plain spot order",
  );
  expect(orderBatchReason(undefined, undefined, "client-batch")).toBe(
    "Client batch is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-batch floor", () => {
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
    ["batch", "Batch is not supported; the adapter would place a plain spot order"],
    ["orderBatch", "Order batch is not supported; the adapter would place a plain spot order"],
    ["clientBatch", "Client batch is not supported; the adapter would place a plain spot order"],
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
        [field]: "group-1",
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
