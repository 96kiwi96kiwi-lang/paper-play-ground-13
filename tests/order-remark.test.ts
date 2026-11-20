import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderRemarkReason } from "@/lib/orders/order-remark";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank remark aliases pass", () => {
  expect(orderRemarkReason(undefined)).toBeNull();
  expect(orderRemarkReason(null, null, null)).toBeNull();
  expect(orderRemarkReason(false, "", "  ")).toBeNull();
});

test("a present remark alias is refused and does not halt", () => {
  expect(orderRemarkReason("hedge note")).toBe(
    "Order remark is not supported; the adapter would place a plain spot order",
  );
  expect(orderRemarkReason(0)).toBe(
    "Order remark is not supported; the adapter would place a plain spot order",
  );
  expect(orderRemarkReason(undefined, "client memo")).toBe(
    "Order remark alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderRemarkReason(undefined, undefined, true)).toBe(
    "Client remark alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-remark floor", () => {
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
    ["remark", "Order remark is not supported; the adapter would place a plain spot order"],
    ["orderRemark", "Order remark alias is not supported; the adapter would place a plain spot order"],
    ["clientRemark", "Client remark alias is not supported; the adapter would place a plain spot order"],
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
