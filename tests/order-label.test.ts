import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderLabelReason } from "@/lib/orders/order-label";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank order-label fields pass", () => {
  expect(orderLabelReason()).toBeNull();
  expect(orderLabelReason(null, null, null)).toBeNull();
  expect(orderLabelReason(false, "", "  ")).toBeNull();
});

test("a present order label field is refused and does not halt", () => {
  expect(orderLabelReason("grid-a")).toBe(
    "Order label is not supported; the adapter would place a plain spot order",
  );
  expect(orderLabelReason(0)).toBe(
    "Order label is not supported; the adapter would place a plain spot order",
  );
  expect(orderLabelReason(undefined, "bot")).toBe(
    "Order label alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderLabelReason(undefined, undefined, "desk")).toBe(
    "Client label alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-label floor", () => {
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
    ["label", "Order label is not supported; the adapter would place a plain spot order"],
    ["orderLabel", "Order label alias is not supported; the adapter would place a plain spot order"],
    ["clientLabel", "Client label alias is not supported; the adapter would place a plain spot order"],
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

  it("passes when label aliases are absent and reaches the adapter", async () => {
    const now = Date.now();
    const placeMarketOrder = vi.fn(async () => ({
      id: "ex-label-1",
      symbol: "BTC-USDT",
      side: "buy" as const,
      type: "market" as const,
      amount: 0.01,
      price: 2_000,
      status: "closed",
      filled: 0.01,
      remaining: 0,
      cost: 20,
      timestamp: now,
    }));
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
      markPrice: 2_000,
      quotedAt: now,
    };

    const result = await manager.submit(intent, riskState);
    expect(result.ok).toBe(true);
    expect(placeMarketOrder).toHaveBeenCalledTimes(1);
    expect(placeLimitOrder).not.toHaveBeenCalled();
    expect(manager.seenOrders()).toHaveLength(1);
  });
});
