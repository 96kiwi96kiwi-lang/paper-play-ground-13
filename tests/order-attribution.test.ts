import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderAttributionReason } from "@/lib/orders/order-attribution";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank attribution aliases pass", () => {
  expect(orderAttributionReason(undefined)).toBeNull();
  expect(orderAttributionReason(null, null, null)).toBeNull();
  expect(orderAttributionReason(false, "", "  ")).toBeNull();
});

test("a present attribution alias is refused and does not halt", () => {
  expect(orderAttributionReason("desk")).toBe(
    "Order attribution is not supported; the adapter would place a plain spot order",
  );
  expect(orderAttributionReason(0)).toBe(
    "Order attribution is not supported; the adapter would place a plain spot order",
  );
  expect(orderAttributionReason(undefined, "client memo")).toBe(
    "Order attribution alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderAttributionReason(undefined, undefined, true)).toBe(
    "Client attribution alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-attribution floor", () => {
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
    ["attribution", "Order attribution is not supported; the adapter would place a plain spot order"],
    ["orderAttribution", "Order attribution alias is not supported; the adapter would place a plain spot order"],
    ["clientAttribution", "Client attribution alias is not supported; the adapter would place a plain spot order"],
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
