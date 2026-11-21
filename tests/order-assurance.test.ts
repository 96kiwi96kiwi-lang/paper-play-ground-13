import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderAssuranceReason } from "@/lib/orders/order-assurance";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank assurance aliases pass", () => {
  expect(orderAssuranceReason(undefined)).toBeNull();
  expect(orderAssuranceReason(null, null, null)).toBeNull();
  expect(orderAssuranceReason(false, "", "  ")).toBeNull();
});

test("a present assurance alias is refused and does not halt", () => {
  expect(orderAssuranceReason("accumulate")).toBe(
    "Assurance is not supported; the adapter would place a plain spot order",
  );
  expect(orderAssuranceReason(0)).toBe(
    "Assurance is not supported; the adapter would place a plain spot order",
  );
  expect(orderAssuranceReason(undefined, "assurance-1")).toBe(
    "Assurance id is not supported; the adapter would place a plain spot order",
  );
  expect(orderAssuranceReason(undefined, undefined, true)).toBe(
    "Order-assurance alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-assurance floor", () => {
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
    ["assurance", "Assurance is not supported; the adapter would place a plain spot order"],
    ["assuranceId", "Assurance id is not supported; the adapter would place a plain spot order"],
    ["orderAssurance", "Order-assurance alias is not supported; the adapter would place a plain spot order"],
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
