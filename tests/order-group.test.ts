import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderGroupReason } from "@/lib/orders/order-group";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank group aliases pass", () => {
  expect(orderGroupReason()).toBeNull();
  expect(orderGroupReason(undefined, undefined, undefined)).toBeNull();
  expect(orderGroupReason(null, null, null)).toBeNull();
  expect(orderGroupReason(false, false, false)).toBeNull();
  expect(orderGroupReason("", "  ", "")).toBeNull();
});

test("a present group alias is refused and does not halt", () => {
  expect(orderGroupReason("grid-a")).toBe(
    "Order group is not supported; the adapter would place a plain spot order",
  );
  expect(orderGroupReason(1)).toBe(
    "Order group is not supported; the adapter would place a plain spot order",
  );
  expect(orderGroupReason(true)).toBe(
    "Order group is not supported; the adapter would place a plain spot order",
  );
  expect(orderGroupReason(undefined, "bot")).toBe(
    "Order group alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderGroupReason(undefined, 0)).toBe(
    "Order group alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderGroupReason(undefined, undefined, "desk")).toBe(
    "Client group alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-group floor", () => {
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
    ["group", "Order group is not supported; the adapter would place a plain spot order"],
    ["orderGroup", "Order group alias is not supported; the adapter would place a plain spot order"],
    ["clientGroup", "Client group alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "grid-a",
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
