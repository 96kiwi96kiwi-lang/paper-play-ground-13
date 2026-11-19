import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderSchemeReason } from "@/lib/orders/order-scheme";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank scheme aliases pass", () => {
  expect(orderSchemeReason(undefined)).toBeNull();
  expect(orderSchemeReason(null, null, null)).toBeNull();
  expect(orderSchemeReason(false, "", "  ")).toBeNull();
});

test("a present scheme alias is refused and does not halt", () => {
  expect(orderSchemeReason("grid-scheme")).toBe(
    "Scheme is not supported; the adapter would place a plain spot order",
  );
  expect(orderSchemeReason(0)).toBe(
    "Scheme is not supported; the adapter would place a plain spot order",
  );
  expect(orderSchemeReason(undefined, "scheme-7")).toBe(
    "Scheme id is not supported; the adapter would place a plain spot order",
  );
  expect(orderSchemeReason(undefined, undefined, true)).toBe(
    "Client scheme is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-scheme floor", () => {
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
    ["scheme", "Scheme is not supported; the adapter would place a plain spot order"],
    ["schemeId", "Scheme id is not supported; the adapter would place a plain spot order"],
    ["clientScheme", "Client scheme is not supported; the adapter would place a plain spot order"],
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
        [field]: "scheme-7",
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
