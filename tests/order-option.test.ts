import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderOptionReason } from "@/lib/orders/order-option";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank option aliases pass", () => {
  expect(orderOptionReason(undefined)).toBeNull();
  expect(orderOptionReason(null, null, null)).toBeNull();
  expect(orderOptionReason(false, "", "  ")).toBeNull();
});

test("a present option alias is refused and does not halt", () => {
  expect(orderOptionReason("opt")).toBe(
    "Option is not supported; the adapter would place a plain spot order",
  );
  expect(orderOptionReason(0)).toBe(
    "Option is not supported; the adapter would place a plain spot order",
  );
  expect(orderOptionReason(undefined, "option-1")).toBe(
    "Option id is not supported; the adapter would place a plain spot order",
  );
  expect(orderOptionReason(undefined, undefined, true)).toBe(
    "Order-option alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-option floor", () => {
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
    ["option", "Option is not supported; the adapter would place a plain spot order"],
    ["optionId", "Option id is not supported; the adapter would place a plain spot order"],
    ["orderOption", "Order-option alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "opt",
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
