import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderSpanReason } from "@/lib/orders/order-span";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank span aliases pass", () => {
  expect(orderSpanReason(undefined)).toBeNull();
  expect(orderSpanReason(null, null, null)).toBeNull();
  expect(orderSpanReason(false, "", "  ")).toBeNull();
});

test("a present span alias is refused and does not halt", () => {
  expect(orderSpanReason("span-abc123")).toBe(
    "Span is not supported; the adapter would place a plain spot order",
  );
  expect(orderSpanReason(0)).toBe(
    "Span is not supported; the adapter would place a plain spot order",
  );
  expect(orderSpanReason(undefined, "ord-span")).toBe(
    "Order span is not supported; the adapter would place a plain spot order",
  );
  expect(orderSpanReason(undefined, undefined, true)).toBe(
    "Client span is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-span floor", () => {
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
    ["span", "Span is not supported; the adapter would place a plain spot order"],
    ["orderSpan", "Order span is not supported; the adapter would place a plain spot order"],
    ["clientSpan", "Client span is not supported; the adapter would place a plain spot order"],
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
        [field]: "span-abc123",
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
