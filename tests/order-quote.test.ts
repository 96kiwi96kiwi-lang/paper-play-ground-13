import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderQuoteReason } from "@/lib/orders/order-quote";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank quote aliases pass", () => {
  expect(orderQuoteReason(undefined)).toBeNull();
  expect(orderQuoteReason(null, null, null)).toBeNull();
  expect(orderQuoteReason(false, "", "  ")).toBeNull();
});

test("a present quote alias is refused and does not halt", () => {
  expect(orderQuoteReason("hedge note")).toBe(
    "Order quote is not supported; the adapter would place a plain spot order",
  );
  expect(orderQuoteReason(0)).toBe(
    "Order quote is not supported; the adapter would place a plain spot order",
  );
  expect(orderQuoteReason(undefined, "client memo")).toBe(
    "Order quote alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderQuoteReason(undefined, undefined, true)).toBe(
    "Client quote alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-quote floor", () => {
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
    ["quote", "Order quote is not supported; the adapter would place a plain spot order"],
    ["orderQuote", "Order quote alias is not supported; the adapter would place a plain spot order"],
    ["clientQuote", "Client quote alias is not supported; the adapter would place a plain spot order"],
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
