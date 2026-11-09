import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderMemoReason } from "@/lib/orders/order-memo";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank memo aliases pass", () => {
  expect(orderMemoReason(undefined)).toBeNull();
  expect(orderMemoReason(null, null, null)).toBeNull();
  expect(orderMemoReason(false, "", "  ")).toBeNull();
});

test("a present memo alias is refused and does not halt", () => {
  expect(orderMemoReason("hedge note")).toBe(
    "Memo is not supported; the adapter would place a plain spot order",
  );
  expect(orderMemoReason(0)).toBe(
    "Memo is not supported; the adapter would place a plain spot order",
  );
  expect(orderMemoReason(undefined, "ord-memo")).toBe(
    "Order memo is not supported; the adapter would place a plain spot order",
  );
  expect(orderMemoReason(undefined, undefined, true)).toBe(
    "Client memo is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-memo floor", () => {
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
    ["memo", "Memo is not supported; the adapter would place a plain spot order"],
    ["orderMemo", "Order memo is not supported; the adapter would place a plain spot order"],
    ["clientMemo", "Client memo is not supported; the adapter would place a plain spot order"],
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
