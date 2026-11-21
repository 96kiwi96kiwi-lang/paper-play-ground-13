import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter, UnifiedOrder } from "@/lib/exchange/types";
import { orderKindReason } from "@/lib/orders/order-kind";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, blank, and false pass", () => {
  expect(orderKindReason(undefined)).toBeNull();
  expect(orderKindReason(null, null, null)).toBeNull();
  expect(orderKindReason("", "  ", false)).toBeNull();
  expect(orderKindReason(false, false, false)).toBeNull();
});

test("a present kind is refused and does not halt", () => {
  expect(orderKindReason("limit")).toBe(
    "Order kind is not supported; the adapter would place a plain spot order",
  );
  expect(orderKindReason(0)).toBe(
    "Order kind is not supported; the adapter would place a plain spot order",
  );
  expect(orderKindReason(undefined, "market")).toBe(
    "Order kind alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderKindReason(undefined, undefined, "stop")).toBe(
    "Client kind alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderKindReason(undefined, undefined, true)).toBe(
    "Client kind alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-kind floor", () => {
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
    ["kind", "Order kind is not supported; the adapter would place a plain spot order"],
    ["orderKind", "Order kind alias is not supported; the adapter would place a plain spot order"],
    ["clientKind", "Client kind alias is not supported; the adapter would place a plain spot order"],
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
      [field]: "limit",
    };

    const result = await manager.submit(intent, riskState);
    expect(result).toEqual({ ok: false, reason });
    expect(placeMarketOrder).not.toHaveBeenCalled();
    expect(placeLimitOrder).not.toHaveBeenCalled();
    expect(manager.seenOrders()).toEqual([]);
  });

  it("passes when kind aliases are absent and reaches the adapter", async () => {
    const now = Date.now();
    const order: UnifiedOrder = {
      id: "ex-kind-1",
      symbol: "BTC-USDT",
      side: "buy",
      type: "market",
      amount: 0.01,
      price: 2_000,
      status: "closed",
      filled: 0.01,
      remaining: 0,
      cost: 20,
      timestamp: now,
    };
    const placeMarketOrder = vi.fn(async () => order);
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
    expect(result.ok, JSON.stringify(result)).toBe(true);
    expect(placeMarketOrder).toHaveBeenCalledTimes(1);
    expect(placeLimitOrder).not.toHaveBeenCalled();
    expect(manager.seenOrders()).toHaveLength(1);
  });
});
