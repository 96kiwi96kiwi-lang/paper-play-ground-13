import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderVisionReason } from "@/lib/orders/order-vision";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank vision aliases pass", () => {
  expect(orderVisionReason(undefined)).toBeNull();
  expect(orderVisionReason(null, null, null)).toBeNull();
  expect(orderVisionReason(false, "", "  ")).toBeNull();
});

test("a present vision alias is refused and does not halt", () => {
  expect(orderVisionReason("accumulate")).toBe(
    "Vision is not supported; the adapter would place a plain spot order",
  );
  expect(orderVisionReason(0)).toBe(
    "Vision is not supported; the adapter would place a plain spot order",
  );
  expect(orderVisionReason(undefined, "vision-1")).toBe(
    "Vision id is not supported; the adapter would place a plain spot order",
  );
  expect(orderVisionReason(undefined, undefined, true)).toBe(
    "Order-vision alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-vision floor", () => {
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
    ["vision", "Vision is not supported; the adapter would place a plain spot order"],
    ["visionId", "Vision id is not supported; the adapter would place a plain spot order"],
    ["orderVision", "Order-vision alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "accumulate",
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
