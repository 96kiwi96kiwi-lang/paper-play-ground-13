import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderDigestReason } from "@/lib/orders/order-digest";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank digest aliases pass", () => {
  expect(orderDigestReason(undefined)).toBeNull();
  expect(orderDigestReason(null, null, null)).toBeNull();
  expect(orderDigestReason(false, "", "  ")).toBeNull();
});

test("a present digest alias is refused and does not halt", () => {
  expect(orderDigestReason("hedge note")).toBe(
    "Order digest is not supported; the adapter would place a plain spot order",
  );
  expect(orderDigestReason(0)).toBe(
    "Order digest is not supported; the adapter would place a plain spot order",
  );
  expect(orderDigestReason(undefined, "client memo")).toBe(
    "Order digest alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderDigestReason(undefined, undefined, true)).toBe(
    "Client digest alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-digest floor", () => {
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
    ["digest", "Order digest is not supported; the adapter would place a plain spot order"],
    ["orderDigest", "Order digest alias is not supported; the adapter would place a plain spot order"],
    ["clientDigest", "Client digest alias is not supported; the adapter would place a plain spot order"],
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
