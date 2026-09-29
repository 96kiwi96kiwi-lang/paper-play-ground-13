import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import type { ExchangeAdapter, UnifiedOrder } from "@/lib/exchange/types";
import { OrderManager } from "@/lib/orders/order-manager";
import { selectStaleOpenOrders } from "@/lib/orders/stale-open";

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

test("closed market fills are not selected as stale", () => {
  const now = Date.now();
  const stale = selectStaleOpenOrders(
    [
      order({
        id: "m1",
        type: "market",
        status: "closed",
        filled: 0.01,
        remaining: 0,
        timestamp: now - TRADING_CONFIG.orders.staleOpenOrderMs * 2,
      }),
    ],
    now,
    TRADING_CONFIG.orders.staleOpenOrderMs,
  );
  expect(stale).toHaveLength(0);
});

test("open limits older than the window are selected", () => {
  const now = Date.now();
  const old = order({
    id: "old",
    timestamp: now - TRADING_CONFIG.orders.staleOpenOrderMs - 1,
  });
  const fresh = order({
    id: "fresh",
    timestamp: now - 1_000,
  });
  const stale = selectStaleOpenOrders([old, fresh], now, TRADING_CONFIG.orders.staleOpenOrderMs);
  expect(stale.map((o) => o.id)).toEqual(["old"]);
});

test("OrderManager cancels stale working orders without touching positions", async () => {
  const canceled: string[] = [];
  const adapter = {
    name: "paper" as const,
    cancelOrder: async (id: string) => {
      canceled.push(id);
    },
  } as unknown as ExchangeAdapter;

  const now = Date.now();
  const manager = new OrderManager(adapter, {
    startingCash: 10_000,
    startingPositions: { "BTC/USDT": { amount: 0.5, avgEntry: 40_000 } },
    seenOrders: [
      order({
        id: "stale-limit",
        timestamp: now - TRADING_CONFIG.orders.staleOpenOrderMs - 5_000,
      }),
    ],
  });

  const result = await manager.cancelStaleOpenOrders(now);
  expect(result.canceled).toBe(1);
  expect(result.failed).toBe(0);
  expect(canceled).toEqual(["stale-limit"]);
  expect(manager.seenOrders()[0]?.status).toBe("canceled");
  expect(manager.positionAmount("BTC/USDT")).toBe(0.5);
});
