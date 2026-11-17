import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderCorrelationReason } from "@/lib/orders/order-correlation";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank correlation aliases pass", () => {
  expect(orderCorrelationReason(undefined)).toBeNull();
  expect(orderCorrelationReason(null, null, null)).toBeNull();
  expect(orderCorrelationReason(false, "", "  ")).toBeNull();
});

test("a present correlation alias is refused and does not halt", () => {
  expect(orderCorrelationReason("corr-abc123")).toBe(
    "Correlation is not supported; the adapter would place a plain spot order",
  );
  expect(orderCorrelationReason(0)).toBe(
    "Correlation is not supported; the adapter would place a plain spot order",
  );
  expect(orderCorrelationReason(undefined, "ord-corr")).toBe(
    "Order correlation is not supported; the adapter would place a plain spot order",
  );
  expect(orderCorrelationReason(undefined, undefined, true)).toBe(
    "Client correlation is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-correlation floor", () => {
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
    ["correlation", "Correlation is not supported; the adapter would place a plain spot order"],
    ["orderCorrelation", "Order correlation is not supported; the adapter would place a plain spot order"],
    ["clientCorrelation", "Client correlation is not supported; the adapter would place a plain spot order"],
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
        [field]: "corr-abc123",
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
