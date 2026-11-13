import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderCaptionReason } from "@/lib/orders/order-caption";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank caption aliases pass", () => {
  expect(orderCaptionReason(undefined)).toBeNull();
  expect(orderCaptionReason(null, null, null)).toBeNull();
  expect(orderCaptionReason(false, "", "  ")).toBeNull();
});

test("a present caption alias is refused and does not halt", () => {
  expect(orderCaptionReason("hedge note")).toBe(
    "Caption is not supported; the adapter would place a plain spot order",
  );
  expect(orderCaptionReason(0)).toBe(
    "Caption is not supported; the adapter would place a plain spot order",
  );
  expect(orderCaptionReason(undefined, "client memo")).toBe(
    "Order caption is not supported; the adapter would place a plain spot order",
  );
  expect(orderCaptionReason(undefined, undefined, true)).toBe(
    "Client caption is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-caption floor", () => {
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
    ["caption", "Caption is not supported; the adapter would place a plain spot order"],
    ["orderCaption", "Order caption is not supported; the adapter would place a plain spot order"],
    ["clientCaption", "Client caption is not supported; the adapter would place a plain spot order"],
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
