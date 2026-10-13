import { describe, expect, it, vi } from "vitest";
import type { ExchangeAdapter } from "../src/lib/exchange/types";
import { OrderManager } from "../src/lib/orders/order-manager";
import { orderPriorityReason } from "../src/lib/orders/order-priority";
import type { RiskState } from "../src/lib/risk";

describe("orderPriorityReason", () => {
  it("passes omitted, null, false, and blank", () => {
    expect(orderPriorityReason()).toBeNull();
    expect(orderPriorityReason(undefined, undefined, undefined)).toBeNull();
    expect(orderPriorityReason(null, null, null)).toBeNull();
    expect(orderPriorityReason(false, false, false)).toBeNull();
    expect(orderPriorityReason("", "  ", "")).toBeNull();
  });

  it("refuses a present priority", () => {
    expect(orderPriorityReason("high")).toMatch(/Order priority is not supported/);
    expect(orderPriorityReason(1)).toMatch(/Order priority is not supported/);
    expect(orderPriorityReason(true)).toMatch(/Order priority is not supported/);
  });

  it("refuses a present orderPriority alias", () => {
    expect(orderPriorityReason(undefined, "low")).toMatch(/Order priority alias is not supported/);
    expect(orderPriorityReason(undefined, 0)).toMatch(/Order priority alias is not supported/);
  });

  it("refuses a present timePriority alias", () => {
    expect(orderPriorityReason(undefined, undefined, "normal")).toMatch(/Time priority alias is not supported/);
  });

  it("is wired into OrderManager before the adapter", async () => {
    const placeMarketOrder = vi.fn();
    const adapter = { name: "paper", placeMarketOrder } as unknown as ExchangeAdapter;
    const manager = new OrderManager(adapter);
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

    const result = await manager.submit(
      {
        symbol: "BTC/USDT",
        side: "buy",
        amount: 0.001,
        type: "market",
        markPrice: 80_000,
        quotedAt: Date.now(),
        priority: "high",
      },
      riskState,
    );

    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/Order priority is not supported/);
    expect(placeMarketOrder).not.toHaveBeenCalled();
    expect(riskState.haltReason).toBeNull();
  });
});
