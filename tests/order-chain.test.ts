import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderChainReason } from "@/lib/orders/order-chain";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank chain aliases pass", () => {
  expect(orderChainReason(undefined)).toBeNull();
  expect(orderChainReason(null, null, null)).toBeNull();
  expect(orderChainReason(false, "", "  ")).toBeNull();
});

test("a present chain alias is refused and does not halt", () => {
  expect(orderChainReason("chain-1")).toBe(
    "Chain id is not supported; the adapter would place a plain spot order",
  );
  expect(orderChainReason(0)).toBe(
    "Chain id is not supported; the adapter would place a plain spot order",
  );
  expect(orderChainReason(undefined, "ord-chain")).toBe(
    "Order chain is not supported; the adapter would place a plain spot order",
  );
  expect(orderChainReason(undefined, undefined, true)).toBe(
    "Client chain is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-chain floor", () => {
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
    ["chainId", "Chain id is not supported; the adapter would place a plain spot order"],
    ["orderChain", "Order chain is not supported; the adapter would place a plain spot order"],
    ["clientChain", "Client chain is not supported; the adapter would place a plain spot order"],
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
        [field]: "chain-1",
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
