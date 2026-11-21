import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderConfidenceReason } from "@/lib/orders/order-confidence";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank confidence aliases pass", () => {
  expect(orderConfidenceReason(undefined)).toBeNull();
  expect(orderConfidenceReason(null, null, null)).toBeNull();
  expect(orderConfidenceReason(false, "", "  ")).toBeNull();
});

test("a present confidence alias is refused and does not halt", () => {
  expect(orderConfidenceReason("accumulate")).toBe(
    "Confidence is not supported; the adapter would place a plain spot order",
  );
  expect(orderConfidenceReason(0)).toBe(
    "Confidence is not supported; the adapter would place a plain spot order",
  );
  expect(orderConfidenceReason(undefined, "confidence-1")).toBe(
    "Confidence id is not supported; the adapter would place a plain spot order",
  );
  expect(orderConfidenceReason(undefined, undefined, true)).toBe(
    "Order-confidence alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-confidence floor", () => {
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
    ["confidence", "Confidence is not supported; the adapter would place a plain spot order"],
    ["confidenceId", "Confidence id is not supported; the adapter would place a plain spot order"],
    ["orderConfidence", "Order-confidence alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "accumulate",
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
