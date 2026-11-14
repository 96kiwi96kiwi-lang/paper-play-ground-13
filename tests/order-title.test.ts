import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderTitleReason } from "@/lib/orders/order-title";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank title aliases pass", () => {
  expect(orderTitleReason(undefined)).toBeNull();
  expect(orderTitleReason(null, null, null)).toBeNull();
  expect(orderTitleReason(false, "", "  ")).toBeNull();
});

test("a present title alias is refused and does not halt", () => {
  expect(orderTitleReason("hedge note")).toBe(
    "Title is not supported; the adapter would place a plain spot order",
  );
  expect(orderTitleReason(0)).toBe(
    "Title is not supported; the adapter would place a plain spot order",
  );
  expect(orderTitleReason(undefined, "client memo")).toBe(
    "Order title is not supported; the adapter would place a plain spot order",
  );
  expect(orderTitleReason(undefined, undefined, true)).toBe(
    "Client title is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-title floor", () => {
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
    ["title", "Title is not supported; the adapter would place a plain spot order"],
    ["orderTitle", "Order title is not supported; the adapter would place a plain spot order"],
    ["clientTitle", "Client title is not supported; the adapter would place a plain spot order"],
  ] as const)("refuses a present %s before the adapter", async (field, reason) => {
    const placeMarketOrder = vi.fn();
    const placeLimitOrder = vi.fn();
    const adapter = {
      name: "paper",
      placeMarketOrder,
      placeLimitOrder,
    } as unknown as ExchangeAdapter;

    const manager = new OrderManager(adapter);
    const intent = {
      symbol: "BTC-USDT",
      side: "buy",
      type: "market",
      amount: 0.01,
      [field]: "grid-a",
    };

    const result = await manager.submit(intent, riskState);
    expect(result).toEqual({ ok: false, reason });
    expect(placeMarketOrder).not.toHaveBeenCalled();
    expect(placeLimitOrder).not.toHaveBeenCalled();
    expect(manager.seenOrders()).toEqual([]);
  });

  it("passes when title aliases are absent and reaches the adapter", async () => {
    const placeMarketOrder = vi.fn();
    const placeLimitOrder = vi.fn();
    const adapter = {
      name: "paper",
      placeMarketOrder,
      placeLimitOrder,
    } as unknown as ExchangeAdapter;

    const manager = new OrderManager(adapter);
    const intent = {
      symbol: "BTC-USDT",
      side: "buy",
      type: "market",
      amount: 0.01,
    };

    const result = await manager.submit(intent, riskState);
    expect(result.ok).toBe(true);
    expect(placeMarketOrder).toHaveBeenCalledTimes(1);
    expect(placeLimitOrder).not.toHaveBeenCalled();
    expect(manager.seenOrders()).toHaveLength(1);
  });
});
