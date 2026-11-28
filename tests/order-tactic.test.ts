import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderTacticReason } from "@/lib/orders/order-tactic";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank tactic aliases pass", () => {
  expect(orderTacticReason(undefined)).toBeNull();
  expect(orderTacticReason(null, null, null)).toBeNull();
  expect(orderTacticReason(false, "", "  ")).toBeNull();
});

test("a present tactic alias is refused and does not halt", () => {
  expect(orderTacticReason("grid-tactic")).toBe(
    "Tactic is not supported; the adapter would place a plain spot order",
  );
  expect(orderTacticReason(0)).toBe(
    "Tactic is not supported; the adapter would place a plain spot order",
  );
  expect(orderTacticReason(undefined, "tactic-7")).toBe(
    "Tactic id is not supported; the adapter would place a plain spot order",
  );
  expect(orderTacticReason(undefined, undefined, true)).toBe(
    "Client tactic is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-tactic floor", () => {
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
    ["tactic", "Tactic is not supported; the adapter would place a plain spot order"],
    ["tacticId", "Tactic id is not supported; the adapter would place a plain spot order"],
    ["clientTactic", "Client tactic is not supported; the adapter would place a plain spot order"],
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
        [field]: "tactic-7",
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
