import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderWindowReason } from "@/lib/orders/order-window";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, blank, and false pass", () => {
  expect(orderWindowReason(undefined)).toBeNull();
  expect(orderWindowReason(null, null, null)).toBeNull();
  expect(orderWindowReason("", "  ", false)).toBeNull();
  expect(orderWindowReason(false, false, false)).toBeNull();
});

test("a present window is refused and does not halt", () => {
  expect(orderWindowReason("1h")).toBe(
    "Order window is not supported; the adapter would place a plain spot order",
  );
  expect(orderWindowReason(0)).toBe(
    "Order window is not supported; the adapter would place a plain spot order",
  );
  expect(orderWindowReason(undefined, "session")).toBe(
    "Order window alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderWindowReason(undefined, undefined, "client-window")).toBe(
    "Client window alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderWindowReason(undefined, undefined, true)).toBe(
    "Client window alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-window floor", () => {
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
    ["window", "Order window is not supported; the adapter would place a plain spot order"],
    ["orderWindow", "Order window alias is not supported; the adapter would place a plain spot order"],
    ["clientWindow", "Client window alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "1h",
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
