import { expect, test } from "vitest";
import type { ExchangeAdapter, UnifiedOrder } from "@/lib/exchange/types";
import { OrderManager } from "@/lib/orders/order-manager";
import { selectWorkingOrders } from "@/lib/orders/stale-open";

function order(over: Partial<UnifiedOrder> = {}): UnifiedOrder {
  return {
    id: over.id ?? "o1",
    symbol: "BTC/USDT",
    side: "buy",
    type: "limit",
    amount: 0.01,
    price: 50_000,
    status: "open",
    filled: 0,
    remaining: 0.01,
    cost: 0,
    timestamp: Date.now(),
    ...over,
  };
}

test("selectWorkingOrders includes fresh limits and skips closed fills", () => {
  const now = Date.now();
  const working = selectWorkingOrders([
    order({ id: "fresh", timestamp: now }),
    order({
      id: "fill",
      type: "market",
      status: "closed",
      filled: 0.01,
      remaining: 0,
    }),
  ]);
  expect(working.map((o) => o.id)).toEqual(["fresh"]);
});

test("OrderManager cancelAllWorkingOrders leaves positions untouched", async () => {
  const canceled: string[] = [];
  const adapter = {
    name: "paper" as const,
    cancelOrder: async (id: string) => {
      canceled.push(id);
    },
  } as unknown as ExchangeAdapter;

  const manager = new OrderManager(adapter, {
    startingCash: 10_000,
    startingPositions: { "ETH/USDT": { amount: 1.2, avgEntry: 3_000 } },
    seenOrders: [
      order({ id: "fresh-limit", timestamp: Date.now() }),
      order({ id: "done", status: "closed", filled: 0.01, remaining: 0 }),
    ],
  });

  const result = await manager.cancelAllWorkingOrders();
  expect(result.canceled).toBe(1);
  expect(result.failed).toBe(0);
  expect(canceled).toEqual(["fresh-limit"]);
  expect(manager.seenOrders().find((o) => o.id === "fresh-limit")?.status).toBe("canceled");
  expect(manager.positionAmount("ETH/USDT")).toBe(1.2);
});
