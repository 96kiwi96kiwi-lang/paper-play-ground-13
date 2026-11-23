import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderVerdictReason } from "@/lib/orders/order-verdict";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank verdict aliases pass", () => {
  expect(orderVerdictReason(undefined)).toBeNull();
  expect(orderVerdictReason(null, null, null)).toBeNull();
  expect(orderVerdictReason(false, "", "  ")).toBeNull();
});

test("a present verdict alias is refused and does not halt", () => {
  expect(orderVerdictReason("guilty")).toBe(
    "Verdict is not supported; the adapter would place a plain spot order",
  );
  expect(orderVerdictReason(0)).toBe(
    "Verdict is not supported; the adapter would place a plain spot order",
  );
  expect(orderVerdictReason(undefined, "verdict-1")).toBe(
    "Verdict id is not supported; the adapter would place a plain spot order",
  );
  expect(orderVerdictReason(undefined, undefined, true)).toBe(
    "Order-verdict alias is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-verdict floor", () => {
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
    ["verdict", "Verdict is not supported; the adapter would place a plain spot order"],
    ["verdictId", "Verdict id is not supported; the adapter would place a plain spot order"],
    ["orderVerdict", "Order-verdict alias is not supported; the adapter would place a plain spot order"],
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
        [field]: "guilty",
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
