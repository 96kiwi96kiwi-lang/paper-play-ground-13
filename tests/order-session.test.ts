import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderSessionReason } from "@/lib/orders/order-session";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank session aliases pass", () => {
  expect(orderSessionReason()).toBeNull();
  expect(orderSessionReason(undefined, undefined, undefined)).toBeNull();
  expect(orderSessionReason(null, null, null)).toBeNull();
  expect(orderSessionReason(false, false, false)).toBeNull();
  expect(orderSessionReason("", "  ", "")).toBeNull();
});

test("a present session alias is refused and does not halt", () => {
  expect(orderSessionReason("web")).toBe(
    "Order session is not supported; the adapter would place a plain spot order",
  );
  expect(orderSessionReason(0)).toBe(
    "Order session is not supported; the adapter would place a plain spot order",
  );
  expect(orderSessionReason(undefined, "api")).toBe(
    "Order session alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderSessionReason(undefined, undefined, "mobile")).toBe(
    "Client session alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-session floor", () => {
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
    ["session", "Order session is not supported; the adapter would place a plain spot order"],
    ["orderSession", "Order session alias is not supported; the adapter would place a plain spot order"],
    ["clientSession", "Client session alias is not supported; the adapter would place a plain spot order"],
  ] as const)("refuses a present %s before the adapter", async (field, reason) => {
    const placeMarketOrder = vi.fn();
    const placeLimitOrder = vi.fn();
    const adapter = {
      name: "paper",
      placeMarketOrder,
      placeLimitOrder,
    } as unknown as ExchangeAdapter;
    const manager = new OrderManager(adapter);

    const result = await manager.submit(
      {
        symbol: "BTC/USDT",
        side: "buy",
        amount: 0.01,
        type: "market",
        [field]: "web",
      },
      riskState,
    );

    expect(result.ok).toBe(false);
    expect(result.reason).toBe(reason);
    expect(placeMarketOrder).not.toHaveBeenCalled();
    expect(placeLimitOrder).not.toHaveBeenCalled();
    expect(manager.seenOrders()).toEqual([]);
    expect(riskState.haltReason).toBeNull();
  });
});
