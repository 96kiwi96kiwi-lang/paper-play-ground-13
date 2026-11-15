import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderTextReason } from "@/lib/orders/order-text";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, blank, and false pass", () => {
  expect(orderTextReason(undefined)).toBeNull();
  expect(orderTextReason(null, null, null)).toBeNull();
  expect(orderTextReason("", "  ", false)).toBeNull();
  expect(orderTextReason(false, false, false)).toBeNull();
});

test("a present text is refused and does not halt", () => {
  expect(orderTextReason("grid-text")).toBe(
    "Order text is not supported; the adapter would place a plain spot order",
  );
  expect(orderTextReason(0)).toBe(
    "Order text is not supported; the adapter would place a plain spot order",
  );
  expect(orderTextReason(undefined, "bybit-text")).toBe(
    "Order text alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderTextReason(undefined, undefined, "client-text")).toBe(
    "Client text alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderTextReason(undefined, undefined, true)).toBe(
    "Client text alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-text floor", () => {
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
    ["text", "Order text is not supported; the adapter would place a plain spot order"],
    ["orderText", "Order text alias is not supported; the adapter would place a plain spot order"],
    ["clientText", "Client text alias is not supported; the adapter would place a plain spot order"],
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
      [field]: "grid-text",
    };

    const result = await manager.submit(intent, riskState);
    expect(result).toEqual({ ok: false, reason });
    expect(placeMarketOrder).not.toHaveBeenCalled();
    expect(placeLimitOrder).not.toHaveBeenCalled();
    expect(manager.seenOrders()).toEqual([]);
  });

  it("passes when text aliases are absent and reaches the adapter", async () => {
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
