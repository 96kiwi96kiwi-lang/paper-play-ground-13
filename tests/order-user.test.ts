import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderUserReason } from "@/lib/orders/order-user";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank user aliases pass", () => {
  expect(orderUserReason(undefined)).toBeNull();
  expect(orderUserReason(null, null, null)).toBeNull();
  expect(orderUserReason(false, "", "  ")).toBeNull();
});

test("a present user alias is refused and does not halt", () => {
  expect(orderUserReason("hedge note")).toBe(
    "User is not supported; the adapter would place a plain spot order",
  );
  expect(orderUserReason(0)).toBe(
    "User is not supported; the adapter would place a plain spot order",
  );
  expect(orderUserReason(undefined, "client memo")).toBe(
    "Order user is not supported; the adapter would place a plain spot order",
  );
  expect(orderUserReason(undefined, undefined, true)).toBe(
    "Client user is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-user floor", () => {
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
    ["user", "User is not supported; the adapter would place a plain spot order"],
    ["orderUser", "Order user is not supported; the adapter would place a plain spot order"],
    ["clientUser", "Client user is not supported; the adapter would place a plain spot order"],
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
        [field]: "trader-1",
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
