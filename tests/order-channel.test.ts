import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderChannelReason } from "@/lib/orders/order-channel";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank channel aliases pass", () => {
  expect(orderChannelReason()).toBeNull();
  expect(orderChannelReason(undefined, undefined, undefined)).toBeNull();
  expect(orderChannelReason(null, null, null)).toBeNull();
  expect(orderChannelReason(false, false, false)).toBeNull();
  expect(orderChannelReason("", "  ", "")).toBeNull();
});

test("a present channel alias is refused and does not halt", () => {
  expect(orderChannelReason("web")).toBe(
    "Order channel is not supported; the adapter would place a plain spot order",
  );
  expect(orderChannelReason(0)).toBe(
    "Order channel is not supported; the adapter would place a plain spot order",
  );
  expect(orderChannelReason(undefined, "api")).toBe(
    "Order channel alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderChannelReason(undefined, undefined, "mobile")).toBe(
    "Origin alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-channel floor", () => {
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
    ["channel", "Order channel is not supported; the adapter would place a plain spot order"],
    ["orderChannel", "Order channel alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "web",
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
