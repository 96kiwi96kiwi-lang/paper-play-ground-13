import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderSourceReason } from "@/lib/orders/order-source";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, blank, and false pass", () => {
  expect(orderSourceReason(undefined)).toBeNull();
  expect(orderSourceReason(null, null, null)).toBeNull();
  expect(orderSourceReason("", "  ", false)).toBeNull();
  expect(orderSourceReason(false, false, false)).toBeNull();
});

test("a present source is refused and does not halt", () => {
  expect(orderSourceReason("grid-a")).toBe(
    "Order source is not supported; the adapter would place a plain spot order",
  );
  expect(orderSourceReason(0)).toBe(
    "Order source is not supported; the adapter would place a plain spot order",
  );
  expect(orderSourceReason(undefined, "bot")).toBe(
    "Order source alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderSourceReason(undefined, undefined, "desk")).toBe(
    "Client source alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderSourceReason(undefined, undefined, true)).toBe(
    "Client source alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-source floor", () => {
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
    ["source", "Order source is not supported; the adapter would place a plain spot order"],
    ["orderSource", "Order source alias is not supported; the adapter would place a plain spot order"],
    ["clientSource", "Client source alias is not supported; the adapter would place a plain spot order"],
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

  it("passes when source aliases are absent and reaches the adapter", async () => {
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
