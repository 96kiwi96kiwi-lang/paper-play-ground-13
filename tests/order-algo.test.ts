import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderAlgoReason } from "@/lib/orders/order-algo";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank algo aliases pass", () => {
  expect(orderAlgoReason(undefined)).toBeNull();
  expect(orderAlgoReason(null, null, null)).toBeNull();
  expect(orderAlgoReason(false, "", "  ")).toBeNull();
});

test("a present algo alias is refused and does not halt", () => {
  expect(orderAlgoReason("twap")).toBe(
    "Algo is not supported; the adapter would place a plain spot order",
  );
  expect(orderAlgoReason(0)).toBe(
    "Algo is not supported; the adapter would place a plain spot order",
  );
  expect(orderAlgoReason(undefined, "iceberg")).toBe(
    "Algo type is not supported; the adapter would place a plain spot order",
  );
  expect(orderAlgoReason(undefined, undefined, true)).toBe(
    "Client algo is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-algo floor", () => {
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
    ["algo", "Algo is not supported; the adapter would place a plain spot order"],
    ["algoType", "Algo type is not supported; the adapter would place a plain spot order"],
    ["clientAlgo", "Client algo is not supported; the adapter would place a plain spot order"],
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
      [field]: "twap",
    };

    const result = await manager.submit(intent, riskState);
    expect(result).toEqual({ ok: false, reason });
    expect(placeMarketOrder).not.toHaveBeenCalled();
    expect(placeLimitOrder).not.toHaveBeenCalled();
    expect(manager.seenOrders()).toEqual([]);
  });

  it("passes when algo aliases are absent and reaches the adapter", async () => {
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
