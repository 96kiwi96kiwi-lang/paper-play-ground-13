import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderJudgmentReason } from "@/lib/orders/order-judgment";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank judgment aliases pass", () => {
  expect(orderJudgmentReason(undefined)).toBeNull();
  expect(orderJudgmentReason(null, null, null)).toBeNull();
  expect(orderJudgmentReason(false, "", "  ")).toBeNull();
});

test("a present judgment alias is refused and does not halt", () => {
  expect(orderJudgmentReason("guilty")).toBe(
    "Judgment is not supported; the adapter would place a plain spot order",
  );
  expect(orderJudgmentReason(0)).toBe(
    "Judgment is not supported; the adapter would place a plain spot order",
  );
  expect(orderJudgmentReason(undefined, "judgment-1")).toBe(
    "Judgment id is not supported; the adapter would place a plain spot order",
  );
  expect(orderJudgmentReason(undefined, undefined, true)).toBe(
    "Order-judgment alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-judgment floor", () => {
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
    ["judgment", "Judgment is not supported; the adapter would place a plain spot order"],
    ["judgmentId", "Judgment id is not supported; the adapter would place a plain spot order"],
    ["orderJudgment", "Order-judgment alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "guilty",
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
