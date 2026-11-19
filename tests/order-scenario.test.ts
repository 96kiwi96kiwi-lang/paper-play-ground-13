import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderScenarioReason } from "@/lib/orders/order-scenario";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank scenario aliases pass", () => {
  expect(orderScenarioReason(undefined)).toBeNull();
  expect(orderScenarioReason(null, null, null)).toBeNull();
  expect(orderScenarioReason(false, "", "  ")).toBeNull();
});

test("a present scenario alias is refused and does not halt", () => {
  expect(orderScenarioReason("grid-scenario")).toBe(
    "Scenario is not supported; the adapter would place a plain spot order",
  );
  expect(orderScenarioReason(0)).toBe(
    "Scenario is not supported; the adapter would place a plain spot order",
  );
  expect(orderScenarioReason(undefined, "scenario-7")).toBe(
    "Scenario id is not supported; the adapter would place a plain spot order",
  );
  expect(orderScenarioReason(undefined, undefined, true)).toBe(
    "Client scenario is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-scenario floor", () => {
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
    ["scenario", "Scenario is not supported; the adapter would place a plain spot order"],
    ["scenarioId", "Scenario id is not supported; the adapter would place a plain spot order"],
    ["clientScenario", "Client scenario is not supported; the adapter would place a plain spot order"],
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
        [field]: "scenario-7",
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
