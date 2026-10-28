import { expect, test } from "vitest";
import type { ExchangeAdapter } from "@/lib/exchange/types";
import { OrderManager, type OrderIntent } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

/**
 * Regression: hourly commits must not replace the persistent, risk-gated
 * OrderManager with a paper-only placeholder. This test needs no exchange.
 */
test("OrderManager exposes the persisted runtime contract", async () => {
  const manager = new OrderManager({ name: "paper" } as ExchangeAdapter, {
    startingCash: 1234,
    startingPositions: { "BTC/USDT": { amount: 0.2, avgEntry: 50000 } },
    seenOrders: [],
    lastSubmitAt: 0,
  });
  expect(manager.snapshot()).toEqual({
    cash: 1234,
    positions: { "BTC/USDT": { amount: 0.2, avgEntry: 50000 } },
  });
  expect(manager.positionAmount("BTC/USDT")).toBe(0.2);
  expect(manager.seenOrders()).toEqual([]);
  expect(await manager.cancelStaleOpenOrders()).toEqual({ canceled: 0, failed: 0 });
  expect(await manager.cancelAllWorkingOrders()).toEqual({ canceled: 0, failed: 0 });
});

test("recent unsupported amount aliases fail before adapter invocation", async () => {
  const manager = new OrderManager({ name: "paper" } as ExchangeAdapter);
  const intent: OrderIntent = { symbol: "BTC/USDT", side: "buy", type: "market", amount: 0.01 };
  const riskState = {} as RiskState;
  const inputs: Array<[keyof OrderIntent, string]> = [
    ["positions", "Positions"], ["orderPositions", "Order positions"], ["basePositions", "Base positions"],
    ["portfolio", "Portfolio"], ["orderPortfolio", "Order portfolio"], ["basePortfolio", "Base portfolio"],
    ["equity", "Equity"], ["orderEquity", "Order equity"], ["baseEquity", "Base equity"],
    ["nav", "Nav"], ["orderNav", "Order nav"], ["baseNav", "Base nav"],
    ["assets", "Assets"], ["orderAssets", "Order assets"], ["baseAssets", "Base assets"],
    ["holdings", "Holdings"], ["orderHoldings", "Order holdings"], ["baseHoldings", "Base holdings"],
  ];
  for (const [field, label] of inputs) {
    const result = await manager.submit({ ...intent, [field]: 0 }, riskState);
    expect(result).toEqual({
      ok: false,
      reason: `${label} alias is not supported; the adapter reads amount`,
    });
  }
  expect(manager.seenOrders()).toEqual([]);
});
