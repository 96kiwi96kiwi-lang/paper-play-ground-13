import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderHashReason } from "@/lib/orders/order-hash";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank hash aliases pass", () => {
  expect(orderHashReason(undefined)).toBeNull();
  expect(orderHashReason(null, null, null)).toBeNull();
  expect(orderHashReason(false, "", "  ")).toBeNull();
});

test("a present hash alias is refused and does not halt", () => {
  expect(orderHashReason("abc123def456")).toBe(
    "Hash is not supported; the adapter would place a plain spot order",
  );
  expect(orderHashReason(0)).toBe(
    "Hash is not supported; the adapter would place a plain spot order",
  );
  expect(orderHashReason(undefined, "ord-hash")).toBe(
    "Order hash is not supported; the adapter would place a plain spot order",
  );
  expect(orderHashReason(undefined, undefined, true)).toBe(
    "Client hash is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-hash floor", () => {
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
    ["hash", "Hash is not supported; the adapter would place a plain spot order"],
    ["orderHash", "Order hash is not supported; the adapter would place a plain spot order"],
    ["clientHash", "Client hash is not supported; the adapter would place a plain spot order"],
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
