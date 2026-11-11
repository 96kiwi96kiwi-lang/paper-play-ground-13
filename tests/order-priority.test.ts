import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderPriorityReason } from "@/lib/orders/order-priority";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank priority aliases pass", () => {
  expect(orderPriorityReason(undefined)).toBeNull();
  expect(orderPriorityReason(null, null, null)).toBeNull();
  expect(orderPriorityReason(false, "", "  ")).toBeNull();
});

test("a present priority alias is refused and does not halt", () => {
  expect(orderPriorityReason("high")).toBe(
    "Priority is not supported; the adapter would place a plain spot order",
  );
  expect(orderPriorityReason(0)).toBe(
    "Priority is not supported; the adapter would place a plain spot order",
  );
  expect(orderPriorityReason(undefined, "urgent")).toBe(
    "Order priority is not supported; the adapter would place a plain spot order",
  );
  expect(orderPriorityReason(undefined, undefined, true)).toBe(
    "Client priority is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-priority floor", () => {
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
    ["priority", "Priority is not supported; the adapter would place a plain spot order"],
    ["orderPriority", "Order priority is not supported; the adapter would place a plain spot order"],
    ["clientPriority", "Client priority is not supported; the adapter would place a plain spot order"],
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
