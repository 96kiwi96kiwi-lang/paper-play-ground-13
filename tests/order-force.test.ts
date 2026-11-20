import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderForceReason } from "@/lib/orders/order-force";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank force aliases pass", () => {
  expect(orderForceReason(undefined)).toBeNull();
  expect(orderForceReason(null, null, null)).toBeNull();
  expect(orderForceReason(false, "", "  ")).toBeNull();
});

test("a present force alias is refused and does not halt", () => {
  expect(orderForceReason("IOC")).toBe(
    "Order force is not supported; the adapter would rest the order as GTC",
  );
  expect(orderForceReason(0)).toBe(
    "Order force is not supported; the adapter would rest the order as GTC",
  );
  expect(orderForceReason(undefined, "FOK")).toBe(
    "Force type is not supported; the adapter would rest the order as GTC",
  );
  expect(orderForceReason(undefined, undefined, true)).toBe(
    "Order-force alias is not supported; the adapter would rest the order as GTC",
  );
});

describe("OrderManager order-force floor", () => {
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
    ["force", "Order force is not supported; the adapter would rest the order as GTC"],
    ["forceType", "Force type is not supported; the adapter would rest the order as GTC"],
    ["orderForce", "Order-force alias is not supported; the adapter would rest the order as GTC"],
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
        [field]: "IOC",
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
