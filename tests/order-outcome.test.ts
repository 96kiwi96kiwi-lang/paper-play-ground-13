import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderOutcomeReason } from "@/lib/orders/order-outcome";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank outcome aliases pass", () => {
  expect(orderOutcomeReason(undefined)).toBeNull();
  expect(orderOutcomeReason(null, null, null)).toBeNull();
  expect(orderOutcomeReason(false, "", "  ")).toBeNull();
});

test("a present outcome alias is refused and does not halt", () => {
  expect(orderOutcomeReason("out")).toBe(
    "Outcome is not supported; the adapter would place a plain spot order",
  );
  expect(orderOutcomeReason(0)).toBe(
    "Outcome is not supported; the adapter would place a plain spot order",
  );
  expect(orderOutcomeReason(undefined, "outcome-1")).toBe(
    "Outcome id is not supported; the adapter would place a plain spot order",
  );
  expect(orderOutcomeReason(undefined, undefined, true)).toBe(
    "Order-outcome alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-outcome floor", () => {
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
    ["outcome", "Outcome is not supported; the adapter would place a plain spot order"],
    ["outcomeId", "Outcome id is not supported; the adapter would place a plain spot order"],
    ["orderOutcome", "Order-outcome alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "out",
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
