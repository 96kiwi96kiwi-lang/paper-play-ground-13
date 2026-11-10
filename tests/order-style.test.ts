import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderStyleReason } from "@/lib/orders/order-style";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank style aliases pass", () => {
  expect(orderStyleReason(undefined)).toBeNull();
  expect(orderStyleReason(null, null, null)).toBeNull();
  expect(orderStyleReason(false, "", "  ")).toBeNull();
});

test("a present style alias is refused and does not halt", () => {
  expect(orderStyleReason("aggressive")).toBe(
    "Style is not supported; the adapter would place a plain spot order",
  );
  expect(orderStyleReason(0)).toBe(
    "Style is not supported; the adapter would place a plain spot order",
  );
  expect(orderStyleReason(undefined, "ord-style")).toBe(
    "Order style is not supported; the adapter would place a plain spot order",
  );
  expect(orderStyleReason(undefined, undefined, true)).toBe(
    "Client style is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-style floor", () => {
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
    ["style", "Style is not supported; the adapter would place a plain spot order"],
    ["orderStyle", "Order style is not supported; the adapter would place a plain spot order"],
    ["clientStyle", "Client style is not supported; the adapter would place a plain spot order"],
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
        [field]: "desk",
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
