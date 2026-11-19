import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderNarrativeReason } from "@/lib/orders/order-narrative";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank narrative aliases pass", () => {
  expect(orderNarrativeReason(undefined)).toBeNull();
  expect(orderNarrativeReason(null, null, null)).toBeNull();
  expect(orderNarrativeReason(false, "", "  ")).toBeNull();
});

test("a present narrative alias is refused and does not halt", () => {
  expect(orderNarrativeReason("grid-narrative")).toBe(
    "Narrative is not supported; the adapter would place a plain spot order",
  );
  expect(orderNarrativeReason(0)).toBe(
    "Narrative is not supported; the adapter would place a plain spot order",
  );
  expect(orderNarrativeReason(undefined, "narrative-7")).toBe(
    "Narrative id is not supported; the adapter would place a plain spot order",
  );
  expect(orderNarrativeReason(undefined, undefined, true)).toBe(
    "Client narrative is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-narrative floor", () => {
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
    ["narrative", "Narrative is not supported; the adapter would place a plain spot order"],
    ["narrativeId", "Narrative id is not supported; the adapter would place a plain spot order"],
    ["clientNarrative", "Client narrative is not supported; the adapter would place a plain spot order"],
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
        [field]: "narrative-7",
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
