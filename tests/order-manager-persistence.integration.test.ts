import { afterEach, expect, test, vi } from "vitest";
import type { ExchangeAdapter, UnifiedOrder } from "@/lib/exchange/types";
import { OrderManager, type OrderIntent, type PortfolioSnapshot } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

/**
 * Integration: the persistent OrderManager must survive a restart, refuse a
 * duplicate id, refuse a buy that would break the cash reserve, cancel without
 * touching inventory, and fail closed when the adapter throws.
 * Paper adapter only. No network and no exchange credentials.
 */

afterEach(() => {
  vi.useRealTimers();
});

const NOW = 1_700_000_000_000;

function freeze(ms = NOW) {
  vi.useFakeTimers();
  vi.setSystemTime(ms);
}

function risk(over: Partial<RiskState> = {}): RiskState {
  return {
    portfolioValue: 10_000,
    cash: 10_000,
    openPositionsCount: 0,
    dailyPnlPct: 0,
    drawdownPct: 0,
    losingStreak: 0,
    cooldownUntil: null,
    haltReason: null,
    tradesToday: 0,
    ...over,
  };
}

function buyIntent(over: Partial<OrderIntent> = {}): OrderIntent {
  return {
    symbol: "BTC/USDT",
    side: "buy",
    type: "market",
    amount: 0.001,
    markPrice: 20_000,
    quotedAt: Date.now(),
    clientOrderId: "cid-buy-1",
    ...over,
  };
}

function filledOrder(over: Partial<UnifiedOrder> = {}): UnifiedOrder {
  return {
    id: "ex-1",
    clientOrderId: "cid-buy-1",
    symbol: "BTC/USDT",
    side: "buy",
    type: "market",
    amount: 0.001,
    price: 20_000,
    status: "closed",
    filled: 0.001,
    remaining: 0,
    cost: 20,
    timestamp: Date.now(),
    ...over,
  };
}

function resting(over: Partial<UnifiedOrder> = {}): UnifiedOrder {
  return {
    id: "rest-1",
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

type Disk = {
  portfolio: PortfolioSnapshot;
  seen: UnifiedOrder[];
  lastSubmitAt: number;
};

function emptyDisk(cash = 10_000): Disk {
  return { portfolio: { cash, positions: {} }, seen: [], lastSubmitAt: 0 };
}

function managerFrom(disk: Disk, adapter: ExchangeAdapter): OrderManager {
  return new OrderManager(adapter, {
    startingCash: disk.portfolio.cash,
    startingPositions: structuredClone(disk.portfolio.positions),
    seenOrders: structuredClone(disk.seen),
    lastSubmitAt: disk.lastSubmitAt,
    onPortfolioChange: (portfolio) => {
      disk.portfolio = structuredClone(portfolio);
    },
    onSeenOrdersChange: (seen) => {
      disk.seen = structuredClone(seen);
    },
    onLastSubmitAtChange: (at) => {
      disk.lastSubmitAt = at;
    },
  });
}

test("paper book and seen orders survive a restart", async () => {
  freeze();
  const disk = emptyDisk();
  const placeMarketOrder = vi.fn(async () => filledOrder());
  const first = managerFrom(disk, {
    name: "paper",
    placeMarketOrder,
  } as unknown as ExchangeAdapter);

  const result = await first.submit(buyIntent(), risk());
  expect(result.ok).toBe(true);
  expect(first.snapshot()).toEqual({
    cash: 9_980,
    positions: { "BTC/USDT": { amount: 0.001, avgEntry: 20_000 } },
  });
  expect(first.seenOrders()).toHaveLength(1);

  const restarted = managerFrom(disk, {
    name: "paper",
    placeMarketOrder,
  } as unknown as ExchangeAdapter);
  expect(restarted.snapshot()).toEqual(first.snapshot());
  expect(restarted.seenOrders()).toEqual(first.seenOrders());
  expect(disk.lastSubmitAt).toBe(NOW);

  const again = await restarted.submit(buyIntent(), risk());
  expect(again).toMatchObject({
    ok: false,
    reason: "Duplicate clientOrderId: cid-buy-1 already used by ex-1",
  });
  expect(placeMarketOrder).toHaveBeenCalledTimes(1);
  expect(restarted.snapshot()).toEqual(first.snapshot());
  expect(restarted.seenOrders()).toHaveLength(1);
});

test("a resubmitted exchange order id is not duplicated and does not double the fill", async () => {
  freeze();
  const placeMarketOrder = vi.fn(
    async (_symbol: string, _side: string, _amount: number, clientOrderId?: string) =>
      filledOrder({ id: "ex-same", clientOrderId, timestamp: NOW }),
  );
  const manager = new OrderManager(
    { name: "paper", placeMarketOrder } as unknown as ExchangeAdapter,
    {
      startingCash: 10_000,
    },
  );

  const first = await manager.submit(buyIntent({ clientOrderId: "cid-a" }), risk());
  expect(first.ok).toBe(true);
  const booked = manager.snapshot();

  freeze(NOW + 30_000);
  const second = await manager.submit(
    buyIntent({ clientOrderId: "cid-b", quotedAt: Date.now() }),
    risk(),
  );

  expect(second.ok).toBe(true);
  expect(placeMarketOrder).toHaveBeenCalledTimes(2);
  expect(manager.seenOrders().map((order) => order.id)).toEqual(["ex-same"]);
  expect(manager.snapshot()).toEqual(booked);
  expect(manager.positionAmount("BTC/USDT")).toBe(0.001);
});

test("insufficient capital is refused before the adapter", async () => {
  freeze();
  const placeMarketOrder = vi.fn();
  const manager = new OrderManager(
    { name: "paper", placeMarketOrder } as unknown as ExchangeAdapter,
    {
      startingCash: 510,
    },
  );

  const state = risk({ cash: 510 });
  const result = await manager.submit(buyIntent({ clientOrderId: "cid-low" }), state);

  expect(result.ok).toBe(false);
  expect(result.reason).toMatch(/Cash reserve/);
  expect(placeMarketOrder).not.toHaveBeenCalled();
  expect(manager.snapshot()).toEqual({ cash: 510, positions: {} });
  expect(manager.seenOrders()).toEqual([]);
  expect(state.haltReason).toBeNull();
});

test("cancel is safe: inventory stays, a second cancel is a no-op, and a throw fails that order only", async () => {
  freeze();
  const calls: string[] = [];
  const adapter = {
    name: "paper" as const,
    cancelOrder: vi.fn(async (id: string) => {
      calls.push(id);
      if (id === "boom") throw new Error("exchange timeout");
    }),
  } as unknown as ExchangeAdapter;
  const manager = new OrderManager(adapter, {
    startingCash: 4_200,
    startingPositions: { "ETH/USDT": { amount: 1.25, avgEntry: 3_000 } },
    seenOrders: [
      resting({ id: "rest-1" }),
      resting({ id: "boom" }),
      resting({ id: "done", status: "closed" }),
    ],
  });

  const first = await manager.cancelAllWorkingOrders();
  expect(first).toEqual({ canceled: 1, failed: 1 });
  expect(calls).toEqual(["rest-1", "boom"]);
  expect(manager.seenOrders().find((order) => order.id === "rest-1")?.status).toBe("canceled");
  expect(manager.seenOrders().find((order) => order.id === "boom")?.status).toBe("open");
  expect(manager.snapshot()).toEqual({
    cash: 4_200,
    positions: { "ETH/USDT": { amount: 1.25, avgEntry: 3_000 } },
  });

  calls.length = 0;
  const second = await manager.cancelAllWorkingOrders();
  expect(second).toEqual({ canceled: 0, failed: 1 });
  expect(calls).toEqual(["boom"]);
  expect(manager.positionAmount("ETH/USDT")).toBe(1.25);
  expect(manager.snapshot().cash).toBe(4_200);

  const empty = new OrderManager({ name: "paper" } as ExchangeAdapter);
  expect(await empty.cancelAllWorkingOrders()).toEqual({ canceled: 0, failed: 0 });
  expect(await empty.cancelStaleOpenOrders()).toEqual({ canceled: 0, failed: 0 });
});

test("adapter errors and unsupported order types fail closed", async () => {
  freeze();
  const placeMarketOrder = vi.fn(async () => {
    throw new Error("socket down");
  });
  const placeLimitOrder = vi.fn();
  const manager = new OrderManager(
    { name: "paper", placeMarketOrder, placeLimitOrder } as unknown as ExchangeAdapter,
    { startingCash: 10_000, startingPositions: { "ETH/USDT": { amount: 2, avgEntry: 3_000 } } },
  );
  const state = risk();

  const blown = await manager.submit(buyIntent({ clientOrderId: "cid-err" }), state);
  expect(blown).toEqual({ ok: false, reason: "Adapter error: socket down" });
  expect(placeMarketOrder).toHaveBeenCalledTimes(1);
  expect(manager.snapshot()).toEqual({
    cash: 10_000,
    positions: { "ETH/USDT": { amount: 2, avgEntry: 3_000 } },
  });
  expect(manager.seenOrders()).toEqual([]);
  expect(state.haltReason).toBeNull();

  const stopped = await manager.submit(
    buyIntent({ type: "stop", clientOrderId: "cid-stop" }),
    state,
  );
  expect(stopped).toEqual({ ok: false, reason: "Unsupported order type: stop" });
  expect(placeLimitOrder).not.toHaveBeenCalled();
  expect(placeMarketOrder).toHaveBeenCalledTimes(1);
  expect(manager.seenOrders()).toEqual([]);
  expect(state.haltReason).toBeNull();
});
