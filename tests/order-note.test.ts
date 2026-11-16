import { describe, expect, it, vi } from "vitest";
import type { ExchangeAdapter } from "../src/lib/exchange/types";
import { orderNoteReason } from "../src/lib/orders/order-note";
import { OrderManager } from "../src/lib/orders/order-manager";
import type { RiskState } from "../src/lib/risk";

describe("orderNoteReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderNoteReason()).toBeNull();
    expect(orderNoteReason(undefined, undefined, undefined)).toBeNull();
    expect(orderNoteReason(null, null, null)).toBeNull();
    expect(orderNoteReason(false, false, false)).toBeNull();
    expect(orderNoteReason("", "  ", "")).toBeNull();
  });

  it("refuses a present note", () => {
    expect(orderNoteReason("grid-a")).toMatch(/Order note is not supported/);
    expect(orderNoteReason(1)).toMatch(/Order note is not supported/);
    expect(orderNoteReason(true)).toMatch(/Order note is not supported/);
  });

  it("refuses a present orderNote alias", () => {
    expect(orderNoteReason(undefined, "bot")).toMatch(/Order note alias is not supported/);
    expect(orderNoteReason(undefined, 0)).toMatch(/Order note alias is not supported/);
  });

  it("refuses a present clientNote alias", () => {
    expect(orderNoteReason(undefined, undefined, "desk")).toMatch(
      /Client note alias is not supported/,
    );
  });
});

describe("OrderManager order-note floor", () => {
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
    ["note", "Order note is not supported; the adapter would place a plain spot order"],
    [
      "orderNote",
      "Order note alias is not supported; the adapter would place a plain spot order",
    ],
    [
      "clientNote",
      "Client note alias is not supported; the adapter would place a plain spot order",
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
