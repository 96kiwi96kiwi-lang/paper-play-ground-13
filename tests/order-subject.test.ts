import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderSubjectReason } from "@/lib/orders/order-subject";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank subject aliases pass", () => {
  expect(orderSubjectReason()).toBeNull();
  expect(orderSubjectReason(undefined, undefined, undefined)).toBeNull();
  expect(orderSubjectReason(null, null, null)).toBeNull();
  expect(orderSubjectReason(false, false, false)).toBeNull();
  expect(orderSubjectReason("", "  ", "")).toBeNull();
});

test("a present subject alias is refused and does not halt", () => {
  expect(orderSubjectReason("grid-a")).toBe(
    "Order subject is not supported; the adapter would place a plain spot order",
  );
  expect(orderSubjectReason(1)).toBe(
    "Order subject is not supported; the adapter would place a plain spot order",
  );
  expect(orderSubjectReason(undefined, "bot")).toBe(
    "Order subject alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderSubjectReason(undefined, undefined, "desk")).toBe(
    "Client subject alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-subject floor", () => {
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
    ["subject", "Order subject is not supported; the adapter would place a plain spot order"],
    ["orderSubject", "Order subject alias is not supported; the adapter would place a plain spot order"],
    ["clientSubject", "Client subject alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "grid-a",
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
