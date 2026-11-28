import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderTrustReason } from "@/lib/orders/order-trust";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank trust aliases pass", () => {
  expect(orderTrustReason(undefined)).toBeNull();
  expect(orderTrustReason(null, null, null)).toBeNull();
  expect(orderTrustReason(false, "", "  ")).toBeNull();
});

test("a present trust alias is refused and does not halt", () => {
  expect(orderTrustReason("strong")).toBe(
    "Trust is not supported; the adapter would place a plain spot order",
  );
  expect(orderTrustReason(0)).toBe(
    "Trust is not supported; the adapter would place a plain spot order",
  );
  expect(orderTrustReason(undefined, "trust-1")).toBe(
    "Trust id is not supported; the adapter would place a plain spot order",
  );
  expect(orderTrustReason(undefined, undefined, true)).toBe(
    "Order-trust alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-trust floor", () => {
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
    ["trust", "Trust is not supported; the adapter would place a plain spot order"],
    ["trustId", "Trust id is not supported; the adapter would place a plain spot order"],
    ["orderTrust", "Order-trust alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "strong",
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
