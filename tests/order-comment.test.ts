import { describe, expect, it, vi } from "vitest";
import type { ExchangeAdapter } from "../src/lib/exchange/types";
import { orderCommentReason } from "../src/lib/orders/order-comment";
import { OrderManager } from "../src/lib/orders/order-manager";
import type { RiskState } from "../src/lib/risk";

describe("orderCommentReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderCommentReason()).toBeNull();
    expect(orderCommentReason(undefined, undefined, undefined)).toBeNull();
    expect(orderCommentReason(null, null, null)).toBeNull();
    expect(orderCommentReason(false, false, false)).toBeNull();
    expect(orderCommentReason("", "  ", "")).toBeNull();
  });

  it("refuses a present comment", () => {
    expect(orderCommentReason("grid-a")).toMatch(/Order comment is not supported/);
    expect(orderCommentReason(1)).toMatch(/Order comment is not supported/);
    expect(orderCommentReason(true)).toMatch(/Order comment is not supported/);
  });

  it("refuses a present orderComment alias", () => {
    expect(orderCommentReason(undefined, "bot")).toMatch(/Order comment alias is not supported/);
    expect(orderCommentReason(undefined, 0)).toMatch(/Order comment alias is not supported/);
  });

  it("refuses a present clientComment alias", () => {
    expect(orderCommentReason(undefined, undefined, "desk")).toMatch(
      /Client comment alias is not supported/,
    );
  });
});

describe("OrderManager order-comment floor", () => {
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
    ["comment", "Order comment is not supported; the adapter would place a plain spot order"],
    [
      "orderComment",
      "Order comment alias is not supported; the adapter would place a plain spot order",
    ],
    [
      "clientComment",
      "Client comment alias is not supported; the adapter would place a plain spot order",
    ],
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
