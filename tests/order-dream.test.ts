import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderDreamReason } from "@/lib/orders/order-dream";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank dream aliases pass", () => {
  expect(orderDreamReason(undefined)).toBeNull();
  expect(orderDreamReason(null, null, null)).toBeNull();
  expect(orderDreamReason(false, "", "  ")).toBeNull();
});

test("a present dream alias is refused and does not halt", () => {
  expect(orderDreamReason("accumulate")).toBe(
    "Dream is not supported; the adapter would place a plain spot order",
  );
  expect(orderDreamReason(0)).toBe(
    "Dream is not supported; the adapter would place a plain spot order",
  );
  expect(orderDreamReason(undefined, "dream-1")).toBe(
    "Dream id is not supported; the adapter would place a plain spot order",
  );
  expect(orderDreamReason(undefined, undefined, true)).toBe(
    "Order-dream alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-dream floor", () => {
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
    ["dream", "Dream is not supported; the adapter would place a plain spot order"],
    ["dreamId", "Dream id is not supported; the adapter would place a plain spot order"],
    ["orderDream", "Order-dream alias is not supported; the adapter would place a plain spot order"],
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
