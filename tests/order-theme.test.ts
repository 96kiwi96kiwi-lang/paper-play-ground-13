import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderThemeReason } from "@/lib/orders/order-theme";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank theme aliases pass", () => {
  expect(orderThemeReason(undefined)).toBeNull();
  expect(orderThemeReason(null, null, null)).toBeNull();
  expect(orderThemeReason(false, "", "  ")).toBeNull();
});

test("a present theme alias is refused and does not halt", () => {
  expect(orderThemeReason("dark")).toBe(
    "Theme is not supported; the adapter would place a plain spot order",
  );
  expect(orderThemeReason(0)).toBe(
    "Theme is not supported; the adapter would place a plain spot order",
  );
  expect(orderThemeReason(undefined, "ord-theme")).toBe(
    "Order theme is not supported; the adapter would place a plain spot order",
  );
  expect(orderThemeReason(undefined, undefined, true)).toBe(
    "Client theme is not supported; the adapter would place a plain spot order",
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
    ["theme", "Theme is not supported; the adapter would place a plain spot order"],
    ["orderTheme", "Order theme is not supported; the adapter would place a plain spot order"],
    ["clientTheme", "Client theme is not supported; the adapter would place a plain spot order"],
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
        [field]: "desk",
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
