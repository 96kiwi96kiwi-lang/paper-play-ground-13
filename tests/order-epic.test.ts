import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderEpicReason } from "@/lib/orders/order-epic";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank epic aliases pass", () => {
  expect(orderEpicReason(undefined)).toBeNull();
  expect(orderEpicReason(null, null, null)).toBeNull();
  expect(orderEpicReason(false, "", "  ")).toBeNull();
});

test("a present epic alias is refused and does not halt", () => {
  expect(orderEpicReason("grid-epic")).toBe(
    "Epic is not supported; the adapter would place a plain spot order",
  );
  expect(orderEpicReason(0)).toBe(
    "Epic is not supported; the adapter would place a plain spot order",
  );
  expect(orderEpicReason(undefined, "epic-7")).toBe(
    "Epic id is not supported; the adapter would place a plain spot order",
  );
  expect(orderEpicReason(undefined, undefined, true)).toBe(
    "Client epic is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-epic floor", () => {
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
    ["epic", "Epic is not supported; the adapter would place a plain spot order"],
    ["epicId", "Epic id is not supported; the adapter would place a plain spot order"],
    ["clientEpic", "Client epic is not supported; the adapter would place a plain spot order"],
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
        [field]: "epic-7",
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
