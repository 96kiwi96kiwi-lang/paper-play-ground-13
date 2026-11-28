import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderMotifReason } from "@/lib/orders/order-motif";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank motif aliases pass", () => {
  expect(orderMotifReason()).toBeNull();
  expect(orderMotifReason(undefined, undefined, undefined)).toBeNull();
  expect(orderMotifReason(null, null, null)).toBeNull();
  expect(orderMotifReason(false, false, false)).toBeNull();
  expect(orderMotifReason("", "  ", "")).toBeNull();
});

test("a present motif alias is refused and does not halt", () => {
  expect(orderMotifReason("repeating")).toBe(
    "Order motif is not supported; the adapter would place a plain spot order",
  );
  expect(orderMotifReason(1)).toBe(
    "Order motif is not supported; the adapter would place a plain spot order",
  );
  expect(orderMotifReason(undefined, "pattern")).toBe(
    "Order motif alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderMotifReason(undefined, undefined, "custom")).toBe(
    "Client motif alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-motif floor", () => {
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
    ["motif", "Order motif is not supported; the adapter would place a plain spot order"],
    ["orderMotif", "Order motif alias is not supported; the adapter would place a plain spot order"],
    ["clientMotif", "Client motif alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "repeating",
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
