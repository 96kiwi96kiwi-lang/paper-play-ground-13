import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderPlayReason } from "@/lib/orders/order-play";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank play aliases pass", () => {
  expect(orderPlayReason(undefined)).toBeNull();
  expect(orderPlayReason(null, null, null)).toBeNull();
  expect(orderPlayReason(false, "", "  ")).toBeNull();
});

test("a present play alias is refused and does not halt", () => {
  expect(orderPlayReason("grid-play")).toBe(
    "Play is not supported; the adapter would place a plain spot order",
  );
  expect(orderPlayReason(0)).toBe(
    "Play is not supported; the adapter would place a plain spot order",
  );
  expect(orderPlayReason(undefined, "play-7")).toBe(
    "Play id is not supported; the adapter would place a plain spot order",
  );
  expect(orderPlayReason(undefined, undefined, true)).toBe(
    "Client play is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-play floor", () => {
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
    ["play", "Play is not supported; the adapter would place a plain spot order"],
    ["playId", "Play id is not supported; the adapter would place a plain spot order"],
    ["clientPlay", "Client play is not supported; the adapter would place a plain spot order"],
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
        [field]: "play-7",
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
