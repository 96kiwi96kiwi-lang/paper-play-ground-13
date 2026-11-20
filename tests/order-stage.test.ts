import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderStageReason } from "@/lib/orders/order-stage";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank stage aliases pass", () => {
  expect(orderStageReason(undefined)).toBeNull();
  expect(orderStageReason(null, null, null)).toBeNull();
  expect(orderStageReason(false, "", "  ")).toBeNull();
});

test("a present stage alias is refused and does not halt", () => {
  expect(orderStageReason("stage-abc123")).toBe(
    "Stage is not supported; the adapter would place a plain spot order",
  );
  expect(orderStageReason(0)).toBe(
    "Stage is not supported; the adapter would place a plain spot order",
  );
  expect(orderStageReason(undefined, "ord-stage")).toBe(
    "Order stage is not supported; the adapter would place a plain spot order",
  );
  expect(orderStageReason(undefined, undefined, true)).toBe(
    "Client stage is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-stage floor", () => {
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
    ["stage", "Stage is not supported; the adapter would place a plain spot order"],
    ["orderStage", "Order stage is not supported; the adapter would place a plain spot order"],
    ["clientStage", "Client stage is not supported; the adapter would place a plain spot order"],
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
        [field]: "stage-abc123",
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
