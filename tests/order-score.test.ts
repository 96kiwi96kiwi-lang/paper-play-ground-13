import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderScoreReason } from "@/lib/orders/order-score";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank score aliases pass", () => {
  expect(orderScoreReason(undefined)).toBeNull();
  expect(orderScoreReason(null, null, null)).toBeNull();
  expect(orderScoreReason(false, "", "  ")).toBeNull();
});

test("a present score alias is refused and does not halt", () => {
  expect(orderScoreReason("high")).toBe(
    "Score is not supported; the adapter would place a plain spot order",
  );
  expect(orderScoreReason(1)).toBe(
    "Score is not supported; the adapter would place a plain spot order",
  );
  expect(orderScoreReason(undefined, "top")).toBe(
    "Order score is not supported; the adapter would place a plain spot order",
  );
  expect(orderScoreReason(undefined, undefined, true)).toBe(
    "Client score is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-score floor", () => {
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
    ["score", "Score is not supported; the adapter would place a plain spot order"],
    ["orderScore", "Order score is not supported; the adapter would place a plain spot order"],
    ["clientScore", "Client score is not supported; the adapter would place a plain spot order"],
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
