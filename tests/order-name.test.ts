import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderNameReason } from "@/lib/orders/order-name";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank name aliases pass", () => {
  expect(orderNameReason(undefined)).toBeNull();
  expect(orderNameReason(null, null, null)).toBeNull();
  expect(orderNameReason(false, "", "  ")).toBeNull();
});

test("a present name alias is refused and does not halt", () => {
  expect(orderNameReason("my-order")).toBe(
    "Name is not supported; the adapter would place a plain spot order",
  );
  expect(orderNameReason(0)).toBe(
    "Name is not supported; the adapter would place a plain spot order",
  );
  expect(orderNameReason(undefined, "ord-name")).toBe(
    "Order name is not supported; the adapter would place a plain spot order",
  );
  expect(orderNameReason(undefined, undefined, true)).toBe(
    "Client name is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-name floor", () => {
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
    ["name", "Name is not supported; the adapter would place a plain spot order"],
    ["orderName", "Order name is not supported; the adapter would place a plain spot order"],
    ["clientName", "Client name is not supported; the adapter would place a plain spot order"],
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

  it("passes when name aliases are absent and reaches the adapter", async () => {
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
