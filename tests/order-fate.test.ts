import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderFateReason } from "@/lib/orders/order-fate";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank fate aliases pass", () => {
  expect(orderFateReason(undefined)).toBeNull();
  expect(orderFateReason(null, null, null)).toBeNull();
  expect(orderFateReason(false, "", "  ")).toBeNull();
});

test("a present fate alias is refused and does not halt", () => {
  expect(orderFateReason("accumulate")).toBe(
    "Fate is not supported; the adapter would place a plain spot order",
  );
  expect(orderFateReason(0)).toBe(
    "Fate is not supported; the adapter would place a plain spot order",
  );
  expect(orderFateReason(undefined, "fate-1")).toBe(
    "Fate id is not supported; the adapter would place a plain spot order",
  );
  expect(orderFateReason(undefined, undefined, true)).toBe(
    "Order-fate alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-fate floor", () => {
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
    ["fate", "Fate is not supported; the adapter would place a plain spot order"],
    ["fateId", "Fate id is not supported; the adapter would place a plain spot order"],
    ["orderFate", "Order-fate alias is not supported; the adapter would place a plain spot order"],
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
