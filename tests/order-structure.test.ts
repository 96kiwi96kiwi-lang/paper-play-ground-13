import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderStructureReason } from "@/lib/orders/order-structure";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank structure aliases pass", () => {
  expect(orderStructureReason()).toBeNull();
  expect(orderStructureReason(undefined, undefined, undefined)).toBeNull();
  expect(orderStructureReason(null, null, null)).toBeNull();
  expect(orderStructureReason(false, false, false)).toBeNull();
  expect(orderStructureReason("", "  ", "")).toBeNull();
});

test("a present structure alias is refused and does not halt", () => {
  expect(orderStructureReason("iceberg")).toBe(
    "Order structure is not supported; the adapter would place a plain spot order",
  );
  expect(orderStructureReason(1)).toBe(
    "Order structure is not supported; the adapter would place a plain spot order",
  );
  expect(orderStructureReason(undefined, "grid")).toBe(
    "Order structure alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderStructureReason(undefined, undefined, "custom")).toBe(
    "Client structure alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-structure floor", () => {
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
    ["structure", "Order structure is not supported; the adapter would place a plain spot order"],
    ["orderStructure", "Order structure alias is not supported; the adapter would place a plain spot order"],
    ["clientStructure", "Client structure alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "iceberg",
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
