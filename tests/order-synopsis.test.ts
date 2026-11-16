import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderSynopsisReason } from "@/lib/orders/order-synopsis";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank synopsis aliases pass", () => {
  expect(orderSynopsisReason(undefined)).toBeNull();
  expect(orderSynopsisReason(null, null, null)).toBeNull();
  expect(orderSynopsisReason(false, "", "  ")).toBeNull();
});

test("a present synopsis alias is refused and does not halt", () => {
  expect(orderSynopsisReason("desk brief")).toBe(
    "Order synopsis is not supported; the adapter would place a plain spot order",
  );
  expect(orderSynopsisReason(0)).toBe(
    "Order synopsis is not supported; the adapter would place a plain spot order",
  );
  expect(orderSynopsisReason(undefined, "client note")).toBe(
    "Order synopsis alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderSynopsisReason(undefined, undefined, true)).toBe(
    "Client synopsis alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-synopsis floor", () => {
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
    ["synopsis", "Order synopsis is not supported; the adapter would place a plain spot order"],
    ["orderSynopsis", "Order synopsis alias is not supported; the adapter would place a plain spot order"],
    ["clientSynopsis", "Client synopsis alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "desk",
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
