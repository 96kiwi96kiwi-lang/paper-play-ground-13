import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderFooterReason } from "@/lib/orders/order-footer";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank footer aliases pass", () => {
  expect(orderFooterReason(undefined)).toBeNull();
  expect(orderFooterReason(null, null, null)).toBeNull();
  expect(orderFooterReason(false, "", "  ")).toBeNull();
});

test("a present footer alias is refused and does not halt", () => {
  expect(orderFooterReason("hedge note")).toBe(
    "Footer is not supported; the adapter would place a plain spot order",
  );
  expect(orderFooterReason(0)).toBe(
    "Footer is not supported; the adapter would place a plain spot order",
  );
  expect(orderFooterReason(undefined, "client memo")).toBe(
    "Order footer is not supported; the adapter would place a plain spot order",
  );
  expect(orderFooterReason(undefined, undefined, true)).toBe(
    "Client footer is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-footer floor", () => {
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
    ["footer", "Footer is not supported; the adapter would place a plain spot order"],
    ["orderFooter", "Order footer is not supported; the adapter would place a plain spot order"],
    ["clientFooter", "Client footer is not supported; the adapter would place a plain spot order"],
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
