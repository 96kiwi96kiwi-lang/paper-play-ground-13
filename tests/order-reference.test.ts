import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderReferenceReason } from "@/lib/orders/order-reference";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank reference aliases pass", () => {
  expect(orderReferenceReason(undefined)).toBeNull();
  expect(orderReferenceReason(null, null, null)).toBeNull();
  expect(orderReferenceReason(false, "", "  ")).toBeNull();
});

test("a present reference alias is refused and does not halt", () => {
  expect(orderReferenceReason("grid-a")).toBe(
    "Order reference is not supported; the adapter would place a plain spot order",
  );
  expect(orderReferenceReason(0)).toBe(
    "Order reference is not supported; the adapter would place a plain spot order",
  );
  expect(orderReferenceReason(undefined, "bot")).toBe(
    "Order reference alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderReferenceReason(undefined, undefined, true)).toBe(
    "Client reference alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-reference floor", () => {
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
    ["reference", "Order reference is not supported; the adapter would place a plain spot order"],
    ["orderReference", "Order reference alias is not supported; the adapter would place a plain spot order"],
    ["clientReference", "Client reference alias is not supported; the adapter would place a plain spot order"],
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
