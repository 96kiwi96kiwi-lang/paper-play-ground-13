import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderDecisionReason } from "@/lib/orders/order-decision";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank decision aliases pass", () => {
  expect(orderDecisionReason(undefined)).toBeNull();
  expect(orderDecisionReason(null, null, null)).toBeNull();
  expect(orderDecisionReason(false, "", "  ")).toBeNull();
});

test("a present decision alias is refused and does not halt", () => {
  expect(orderDecisionReason("approve")).toBe(
    "Decision is not supported; the adapter would place a plain spot order",
  );
  expect(orderDecisionReason(0)).toBe(
    "Decision is not supported; the adapter would place a plain spot order",
  );
  expect(orderDecisionReason(undefined, "decision-1")).toBe(
    "Decision id is not supported; the adapter would place a plain spot order",
  );
  expect(orderDecisionReason(undefined, undefined, true)).toBe(
    "Order-decision alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-decision floor", () => {
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
    ["decision", "Decision is not supported; the adapter would place a plain spot order"],
    ["decisionId", "Decision id is not supported; the adapter would place a plain spot order"],
    ["orderDecision", "Order-decision alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "approve",
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
