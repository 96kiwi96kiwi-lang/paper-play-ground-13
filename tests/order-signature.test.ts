import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderSignatureReason } from "@/lib/orders/order-signature";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank signature aliases pass", () => {
  expect(orderSignatureReason(undefined)).toBeNull();
  expect(orderSignatureReason(null, null, null)).toBeNull();
  expect(orderSignatureReason(false, "", "  ")).toBeNull();
});

test("a present signature alias is refused and does not halt", () => {
  expect(orderSignatureReason("grid-a")).toBe(
    "Order signature is not supported; the adapter would place a plain spot order",
  );
  expect(orderSignatureReason(0)).toBe(
    "Order signature is not supported; the adapter would place a plain spot order",
  );
  expect(orderSignatureReason(undefined, "bot")).toBe(
    "Order signature alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderSignatureReason(undefined, undefined, true)).toBe(
    "Client signature alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-signature floor", () => {
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
    ["signature", "Order signature is not supported; the adapter would place a plain spot order"],
    ["orderSignature", "Order signature alias is not supported; the adapter would place a plain spot order"],
    ["clientSignature", "Client signature alias is not supported; the adapter would place a plain spot order"],
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
