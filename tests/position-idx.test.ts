import { expect, test } from "vitest";
import { positionIdxReason } from "@/lib/orders/position-idx";

test("omitted, null, false, and blank position-idx fields pass", () => {
  expect(positionIdxReason(undefined)).toBeNull();
  expect(positionIdxReason(null, null, null)).toBeNull();
  expect(positionIdxReason(false, "", "  ")).toBeNull();
});

test("a present position index field is refused and does not halt", () => {
  expect(positionIdxReason(true)).toBe(
    "Position index is not supported; the adapter places one spot order",
  );
  expect(positionIdxReason(0)).toBe(
    "Position index is not supported; the adapter places one spot order",
  );
  expect(positionIdxReason(undefined, 1)).toBe(
    "Pos index is not supported; the adapter places one spot order",
  );
  expect(positionIdxReason(undefined, undefined, "hedge")).toBe(
    "Hedge index is not supported; the adapter places one spot order",
  );
});


import { vi } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

test("position index is wired into OrderManager before the adapter", async () => {
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
      posIdx: 0,
    },
    riskState,
  );

  expect(result.ok).toBe(false);
  expect(result.reason).toMatch(/Pos index is not supported/);
  expect(placeMarketOrder).not.toHaveBeenCalled();
  expect(riskState.haltReason).toBeNull();
});
