import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderFingerprintReason } from "@/lib/orders/order-fingerprint";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank fingerprint aliases pass", () => {
  expect(orderFingerprintReason(undefined)).toBeNull();
  expect(orderFingerprintReason(null, null, null)).toBeNull();
  expect(orderFingerprintReason(false, "", "  ")).toBeNull();
});

test("a present fingerprint alias is refused and does not halt", () => {
  expect(orderFingerprintReason("hedge note")).toBe(
    "Order fingerprint is not supported; the adapter would place a plain spot order",
  );
  expect(orderFingerprintReason(0)).toBe(
    "Order fingerprint is not supported; the adapter would place a plain spot order",
  );
  expect(orderFingerprintReason(undefined, "client memo")).toBe(
    "Order fingerprint alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderFingerprintReason(undefined, undefined, true)).toBe(
    "Client fingerprint alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-fingerprint floor", () => {
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
    ["fingerprint", "Order fingerprint is not supported; the adapter would place a plain spot order"],
    ["orderFingerprint", "Order fingerprint alias is not supported; the adapter would place a plain spot order"],
    ["clientFingerprint", "Client fingerprint alias is not supported; the adapter would place a plain spot order"],
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
