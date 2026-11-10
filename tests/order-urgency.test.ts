import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderUrgencyReason } from "@/lib/orders/order-urgency";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank urgency aliases pass", () => {
  expect(orderUrgencyReason(undefined)).toBeNull();
  expect(orderUrgencyReason(null, null, null)).toBeNull();
  expect(orderUrgencyReason(false, "", "  ")).toBeNull();
});

test("a present urgency alias is refused and does not halt", () => {
  expect(orderUrgencyReason("high")).toBe(
    "Urgency is not supported; the adapter would place a plain spot order",
  );
  expect(orderUrgencyReason(0)).toBe(
    "Urgency is not supported; the adapter would place a plain spot order",
  );
  expect(orderUrgencyReason(undefined, "urgent")).toBe(
    "Order urgency is not supported; the adapter would place a plain spot order",
  );
  expect(orderUrgencyReason(undefined, undefined, true)).toBe(
    "Client urgency is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-urgency floor", () => {
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
    ["urgency", "Urgency is not supported; the adapter would place a plain spot order"],
    ["orderUrgency", "Order urgency is not supported; the adapter would place a plain spot order"],
    ["clientUrgency", "Client urgency is not supported; the adapter would place a plain spot order"],
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
