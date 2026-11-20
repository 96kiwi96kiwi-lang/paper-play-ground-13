import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderMessageReason } from "@/lib/orders/order-message";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, blank, and false pass", () => {
  expect(orderMessageReason(undefined)).toBeNull();
  expect(orderMessageReason(null, null, null)).toBeNull();
  expect(orderMessageReason("", "  ", false)).toBeNull();
  expect(orderMessageReason(false, false, false)).toBeNull();
});

test("a present message is refused and does not halt", () => {
  expect(orderMessageReason("grid-msg")).toBe(
    "Order message is not supported; the adapter would place a plain spot order",
  );
  expect(orderMessageReason(0)).toBe(
    "Order message is not supported; the adapter would place a plain spot order",
  );
  expect(orderMessageReason(undefined, "bybit-msg")).toBe(
    "Order message alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderMessageReason(undefined, undefined, "client-msg")).toBe(
    "Client message alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderMessageReason(undefined, undefined, true)).toBe(
    "Client message alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-message floor", () => {
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
    ["message", "Order message is not supported; the adapter would place a plain spot order"],
    ["orderMessage", "Order message alias is not supported; the adapter would place a plain spot order"],
    ["clientMessage", "Client message alias is not supported; the adapter would place a plain spot order"],
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
