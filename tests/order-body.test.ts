import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderBodyReason } from "@/lib/orders/order-body";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank body aliases pass", () => {
  expect(orderBodyReason(undefined)).toBeNull();
  expect(orderBodyReason(null, null, null)).toBeNull();
  expect(orderBodyReason(false, "", "  ")).toBeNull();
});

test("a present body alias is refused and does not halt", () => {
  expect(orderBodyReason("hedge note")).toBe(
    "Body is not supported; the adapter would place a plain spot order",
  );
  expect(orderBodyReason(0)).toBe(
    "Body is not supported; the adapter would place a plain spot order",
  );
  expect(orderBodyReason(undefined, "client memo")).toBe(
    "Order body is not supported; the adapter would place a plain spot order",
  );
  expect(orderBodyReason(undefined, undefined, true)).toBe(
    "Client body is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-body floor", () => {
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
    ["body", "Body is not supported; the adapter would place a plain spot order"],
    ["orderBody", "Order body is not supported; the adapter would place a plain spot order"],
    ["clientBody", "Client body is not supported; the adapter would place a plain spot order"],
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
