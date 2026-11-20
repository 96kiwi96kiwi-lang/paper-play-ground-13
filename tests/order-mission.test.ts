import { describe, expect, it, test, vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { orderMissionReason } from "@/lib/orders/order-mission";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("omitted, null, false, and blank mission aliases pass", () => {
  expect(orderMissionReason(undefined)).toBeNull();
  expect(orderMissionReason(null, null, null)).toBeNull();
  expect(orderMissionReason(false, "", "  ")).toBeNull();
});

test("a present mission alias is refused and does not halt", () => {
  expect(orderMissionReason("grid-mission")).toBe(
    "Mission is not supported; the adapter would place a plain spot order",
  );
  expect(orderMissionReason(0)).toBe(
    "Mission is not supported; the adapter would place a plain spot order",
  );
  expect(orderMissionReason(undefined, "mission-7")).toBe(
    "Mission id is not supported; the adapter would place a plain spot order",
  );
  expect(orderMissionReason(undefined, undefined, true)).toBe(
    "Client mission is not supported; the adapter would place a plain spot order",
  );
});

describe("OrderManager order-mission floor", () => {
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
    ["mission", "Mission is not supported; the adapter would place a plain spot order"],
    ["missionId", "Mission id is not supported; the adapter would place a plain spot order"],
    ["clientMission", "Client mission is not supported; the adapter would place a plain spot order"],
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
        [field]: "mission-7",
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
