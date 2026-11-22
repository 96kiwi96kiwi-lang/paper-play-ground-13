import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderFervorReason } from "@/lib/orders/order-fervor";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank fervor aliases pass", () => {
  expect(orderFervorReason(undefined)).toBeNull();
  expect(orderFervorReason(null, null, null)).toBeNull();
  expect(orderFervorReason(false, "", "  ")).toBeNull();
});

test("a present fervor alias is refused and does not halt", () => {
  expect(orderFervorReason("strong")).toBe(
    "Fervor is not supported; the adapter would place a plain spot order",
  );
  expect(orderFervorReason(0)).toBe(
    "Fervor is not supported; the adapter would place a plain spot order",
  );
  expect(orderFervorReason(undefined, "fervor-1")).toBe(
    "Fervor id is not supported; the adapter would place a plain spot order",
  );
  expect(orderFervorReason(undefined, undefined, true)).toBe(
    "Order-fervor alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-fervor floor", () => {
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
    ["fervor", "Fervor is not supported; the adapter would place a plain spot order"],
    ["fervorId", "Fervor id is not supported; the adapter would place a plain spot order"],
    ["orderFervor", "Order-fervor alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "strong",
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
