import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderOriginReason } from "@/lib/orders/order-origin";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, blank, and false pass", () => {
  expect(orderOriginReason(undefined)).toBeNull();
  expect(orderOriginReason(null, null, null)).toBeNull();
  expect(orderOriginReason("", "  ", false)).toBeNull();
  expect(orderOriginReason(false, false, false)).toBeNull();
});

test("a present origin is refused and does not halt", () => {
  expect(orderOriginReason("web")).toBe(
    "Order origin is not supported; the adapter would place a plain spot order",
  );
  expect(orderOriginReason(0)).toBe(
    "Order origin is not supported; the adapter would place a plain spot order",
  );
  expect(orderOriginReason(undefined, "api")).toBe(
    "Order origin alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderOriginReason(undefined, undefined, "mobile")).toBe(
    "Client origin alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderOriginReason(undefined, undefined, true)).toBe(
    "Client origin alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-origin floor", () => {
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
    ["origin", "Order origin is not supported; the adapter would place a plain spot order"],
    ["orderOrigin", "Order origin alias is not supported; the adapter would place a plain spot order"],
    ["clientOrigin", "Client origin alias is not supported; the adapter would place a plain spot order"],
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
      [field]: "web",
    };

    const result = await manager.submit(intent, riskState);
    expect(result).toEqual({ ok: false, reason });
    expect(placeMarketOrder).not.toHaveBeenCalled();
    expect(placeLimitOrder).not.toHaveBeenCalled();
    expect(manager.seenOrders()).toEqual([]);
  });

  it("passes when origin aliases are absent and reaches the adapter", async () => {
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
