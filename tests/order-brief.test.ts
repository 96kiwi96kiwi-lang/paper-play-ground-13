import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderBriefReason } from "@/lib/orders/order-brief";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank brief aliases pass", () => {
  expect(orderBriefReason(undefined)).toBeNull();
  expect(orderBriefReason(null, null, null)).toBeNull();
  expect(orderBriefReason(false, "", "  ")).toBeNull();
});

test("a present brief alias is refused and does not halt", () => {
  expect(orderBriefReason("hedge note")).toBe(
    "Order brief is not supported; the adapter would place a plain spot order",
  );
  expect(orderBriefReason(0)).toBe(
    "Order brief is not supported; the adapter would place a plain spot order",
  );
  expect(orderBriefReason(undefined, "client memo")).toBe(
    "Order brief alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderBriefReason(undefined, undefined, true)).toBe(
    "Client brief alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-brief floor", () => {
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
    ["brief", "Order brief is not supported; the adapter would place a plain spot order"],
    ["orderBrief", "Order brief alias is not supported; the adapter would place a plain spot order"],
    ["clientBrief", "Client brief alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "hedge note",
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
