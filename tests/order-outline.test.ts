import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderOutlineReason } from "@/lib/orders/order-outline";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank outline aliases pass", () => {
  expect(orderOutlineReason(undefined)).toBeNull();
  expect(orderOutlineReason(null, null, null)).toBeNull();
  expect(orderOutlineReason(false, "", "  ")).toBeNull();
});

test("a present outline alias is refused and does not halt", () => {
  expect(orderOutlineReason("hedge note")).toBe(
    "Order outline is not supported; the adapter would place a plain spot order",
  );
  expect(orderOutlineReason(0)).toBe(
    "Order outline is not supported; the adapter would place a plain spot order",
  );
  expect(orderOutlineReason(undefined, "client memo")).toBe(
    "Order outline alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderOutlineReason(undefined, undefined, true)).toBe(
    "Client outline alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-outline floor", () => {
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
    ["outline", "Order outline is not supported; the adapter would place a plain spot order"],
    ["orderOutline", "Order outline alias is not supported; the adapter would place a plain spot order"],
    ["clientOutline", "Client outline alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "hedge note",
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
