import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderAbstractReason } from "@/lib/orders/order-abstract";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank abstract aliases pass", () => {
  expect(orderAbstractReason(undefined)).toBeNull();
  expect(orderAbstractReason(null, null, null)).toBeNull();
  expect(orderAbstractReason(false, "", "  ")).toBeNull();
});

test("a present abstract alias is refused and does not halt", () => {
  expect(orderAbstractReason("hedge note")).toBe(
    "Order abstract is not supported; the adapter would place a plain spot order",
  );
  expect(orderAbstractReason(0)).toBe(
    "Order abstract is not supported; the adapter would place a plain spot order",
  );
  expect(orderAbstractReason(undefined, "client memo")).toBe(
    "Order abstract alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderAbstractReason(undefined, undefined, true)).toBe(
    "Client abstract alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-abstract floor", () => {
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
    ["abstract", "Order abstract is not supported; the adapter would place a plain spot order"],
    ["orderAbstract", "Order abstract alias is not supported; the adapter would place a plain spot order"],
    ["clientAbstract", "Client abstract alias is not supported; the adapter would place a plain spot order"],
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

  it("passes when abstract aliases are absent and reaches the adapter", async () => {
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
