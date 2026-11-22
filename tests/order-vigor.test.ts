import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderVigorReason } from "@/lib/orders/order-vigor";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank vigor aliases pass", () => {
  expect(orderVigorReason(undefined)).toBeNull();
  expect(orderVigorReason(null, null, null)).toBeNull();
  expect(orderVigorReason(false, "", "  ")).toBeNull();
});

test("a present vigor alias is refused and does not halt", () => {
  expect(orderVigorReason("high")).toBe(
    "Vigor is not supported; the adapter would place a plain spot order",
  );
  expect(orderVigorReason(0)).toBe(
    "Vigor is not supported; the adapter would place a plain spot order",
  );
  expect(orderVigorReason(undefined, "vigor-1")).toBe(
    "Vigor id is not supported; the adapter would place a plain spot order",
  );
  expect(orderVigorReason(undefined, undefined, true)).toBe(
    "Order-vigor alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-vigor floor", () => {
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
    ["vigor", "Vigor is not supported; the adapter would place a plain spot order"],
    ["vigorId", "Vigor id is not supported; the adapter would place a plain spot order"],
    ["orderVigor", "Order-vigor alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "high",
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
