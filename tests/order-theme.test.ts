import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderThemeReason } from "@/lib/orders/order-theme";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank theme aliases pass", () => {
  expect(orderThemeReason()).toBeNull();
  expect(orderThemeReason(undefined, undefined, undefined)).toBeNull();
  expect(orderThemeReason(null, null, null)).toBeNull();
  expect(orderThemeReason(false, false, false)).toBeNull();
  expect(orderThemeReason("", "  ", "")).toBeNull();
});

test("a present theme alias is refused and does not halt", () => {
  expect(orderThemeReason("dark")).toBe(
    "Order theme is not supported; the adapter would place a plain spot order",
  );
  expect(orderThemeReason(1)).toBe(
    "Order theme is not supported; the adapter would place a plain spot order",
  );
  expect(orderThemeReason(undefined, "light")).toBe(
    "Order theme alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderThemeReason(undefined, undefined, "custom")).toBe(
    "Client theme alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-theme floor", () => {
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
    ["theme", "Order theme is not supported; the adapter would place a plain spot order"],
    ["orderTheme", "Order theme alias is not supported; the adapter would place a plain spot order"],
    ["clientTheme", "Client theme alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "dark",
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
