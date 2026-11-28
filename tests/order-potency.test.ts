import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderPotencyReason } from "@/lib/orders/order-potency";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank potency aliases pass", () => {
  expect(orderPotencyReason(undefined)).toBeNull();
  expect(orderPotencyReason(null, null, null)).toBeNull();
  expect(orderPotencyReason(false, "", "  ")).toBeNull();
});

test("a present potency alias is refused and does not halt", () => {
  expect(orderPotencyReason("high")).toBe(
    "Potency is not supported; the adapter would place a plain spot order",
  );
  expect(orderPotencyReason(0)).toBe(
    "Potency is not supported; the adapter would place a plain spot order",
  );
  expect(orderPotencyReason(undefined, "potency-1")).toBe(
    "Potency id is not supported; the adapter would place a plain spot order",
  );
  expect(orderPotencyReason(undefined, undefined, true)).toBe(
    "Order-potency alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-potency floor", () => {
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
    ["potency", "Potency is not supported; the adapter would place a plain spot order"],
    ["potencyId", "Potency id is not supported; the adapter would place a plain spot order"],
    ["orderPotency", "Order-potency alias is not supported; the adapter would place a plain spot order"],
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
