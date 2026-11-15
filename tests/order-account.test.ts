import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter, UnifiedOrder } from "@/lib/exchange/types";
import { orderAccountReason } from "@/lib/orders/order-account";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank account aliases pass", () => {
  expect(orderAccountReason(undefined)).toBeNull();
  expect(orderAccountReason(null, null, null)).toBeNull();
  expect(orderAccountReason(false, "", "  ")).toBeNull();
});

test("a present account alias is refused and does not halt", () => {
  expect(orderAccountReason("subaccount-1")).toBe(
    "Account is not supported; the adapter would place a plain spot order",
  );
  expect(orderAccountReason(0)).toBe(
    "Account is not supported; the adapter would place a plain spot order",
  );
  expect(orderAccountReason(undefined, "trading-wallet")).toBe(
    "Order account is not supported; the adapter would place a plain spot order",
  );
  expect(orderAccountReason(undefined, undefined, true)).toBe(
    "Client account is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-account floor", () => {
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
    ["account", "Account is not supported; the adapter would place a plain spot order"],
    ["orderAccount", "Order account is not supported; the adapter would place a plain spot order"],
    ["clientAccount", "Client account is not supported; the adapter would place a plain spot order"],
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
      [field]: "subaccount-1",
    };

    const result = await manager.submit(intent, riskState);
    expect(result).toEqual({ ok: false, reason });
    expect(placeMarketOrder).not.toHaveBeenCalled();
    expect(placeLimitOrder).not.toHaveBeenCalled();
    expect(manager.seenOrders()).toEqual([]);
  });

  it("passes when account aliases are absent and reaches the adapter", async () => {
    const now = Date.now();
    const order: UnifiedOrder = {
      id: "ex-account-1",
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
