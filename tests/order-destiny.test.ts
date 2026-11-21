import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderDestinyReason } from "@/lib/orders/order-destiny";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank destiny aliases pass", () => {
  expect(orderDestinyReason(undefined)).toBeNull();
  expect(orderDestinyReason(null, null, null)).toBeNull();
  expect(orderDestinyReason(false, "", "  ")).toBeNull();
});

test("a present destiny alias is refused and does not halt", () => {
  expect(orderDestinyReason("fate")).toBe(
    "Destiny is not supported; the adapter would place a plain spot order",
  );
  expect(orderDestinyReason(0)).toBe(
    "Destiny is not supported; the adapter would place a plain spot order",
  );
  expect(orderDestinyReason(undefined, "destiny-1")).toBe(
    "Destiny id is not supported; the adapter would place a plain spot order",
  );
  expect(orderDestinyReason(undefined, undefined, true)).toBe(
    "Order-destiny alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-destiny floor", () => {
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
    ["destiny", "Destiny is not supported; the adapter would place a plain spot order"],
    ["destinyId", "Destiny id is not supported; the adapter would place a plain spot order"],
    ["orderDestiny", "Order-destiny alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "fate",
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
