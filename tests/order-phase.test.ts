import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderPhaseReason } from "@/lib/orders/order-phase";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank phase aliases pass", () => {
  expect(orderPhaseReason(undefined)).toBeNull();
  expect(orderPhaseReason(null, null, null)).toBeNull();
  expect(orderPhaseReason(false, "", "  ")).toBeNull();
});

test("a present phase alias is refused and does not halt", () => {
  expect(orderPhaseReason("phase-abc123")).toBe(
    "Phase is not supported; the adapter would place a plain spot order",
  );
  expect(orderPhaseReason(0)).toBe(
    "Phase is not supported; the adapter would place a plain spot order",
  );
  expect(orderPhaseReason(undefined, "ord-phase")).toBe(
    "Order phase is not supported; the adapter would place a plain spot order",
  );
  expect(orderPhaseReason(undefined, undefined, true)).toBe(
    "Client phase is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-phase floor", () => {
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
    ["phase", "Phase is not supported; the adapter would place a plain spot order"],
    ["orderPhase", "Order phase is not supported; the adapter would place a plain spot order"],
    ["clientPhase", "Client phase is not supported; the adapter would place a plain spot order"],
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
        [field]: "phase-abc123",
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
