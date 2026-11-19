import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderSagaReason } from "@/lib/orders/order-saga";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank saga aliases pass", () => {
  expect(orderSagaReason(undefined)).toBeNull();
  expect(orderSagaReason(null, null, null)).toBeNull();
  expect(orderSagaReason(false, "", "  ")).toBeNull();
});

test("a present saga alias is refused and does not halt", () => {
  expect(orderSagaReason("grid-saga")).toBe(
    "Saga is not supported; the adapter would place a plain spot order",
  );
  expect(orderSagaReason(0)).toBe(
    "Saga is not supported; the adapter would place a plain spot order",
  );
  expect(orderSagaReason(undefined, "saga-7")).toBe(
    "Saga id is not supported; the adapter would place a plain spot order",
  );
  expect(orderSagaReason(undefined, undefined, true)).toBe(
    "Client saga is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-saga floor", () => {
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
    ["saga", "Saga is not supported; the adapter would place a plain spot order"],
    ["sagaId", "Saga id is not supported; the adapter would place a plain spot order"],
    ["clientSaga", "Client saga is not supported; the adapter would place a plain spot order"],
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
        [field]: "saga-7",
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
