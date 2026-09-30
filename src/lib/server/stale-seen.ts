/**
 * Paper-only bookkeeping: mark persisted working orders as canceled.
 * Does not call KuCoin, invent quotes, or flatten positions.
 */

import { TRADING_CONFIG } from "@/config/trading";
import { selectStaleOpenOrders, selectWorkingOrders } from "@/lib/orders/stale-open";
import type { UnifiedOrder } from "@/lib/exchange/types";
import { loadSeenOrders, persistSeenOrders } from "./persist";

export type StaleSeenSweep = {
  canceled: number;
  remainingWorking: number;
};

function remainingWorkingCount(orders: UnifiedOrder[]): number {
  return selectWorkingOrders(orders).length;
}

function markCanceled(seen: UnifiedOrder[], selected: UnifiedOrder[]): UnifiedOrder[] {
  const ids = new Set(selected.map((o) => o.id));
  return seen.map((order) => {
    if (!ids.has(order.id)) return order;
    return {
      ...order,
      status: "canceled",
      remaining: order.remaining ?? Math.max(0, order.amount - (order.filled ?? 0)),
    };
  });
}

export function cancelStaleSeenOrdersOnDisk(now = Date.now()): StaleSeenSweep {
  const seen = loadSeenOrders();
  const stale = selectStaleOpenOrders(seen, now, TRADING_CONFIG.orders.staleOpenOrderMs);
  if (stale.length === 0) {
    return { canceled: 0, remainingWorking: remainingWorkingCount(seen) };
  }
  const next = markCanceled(seen, stale);
  persistSeenOrders(next);
  return { canceled: stale.length, remainingWorking: remainingWorkingCount(next) };
}

/** Halt path: cancel every persisted working order, including fresh limits. */
export function cancelAllWorkingSeenOrdersOnDisk(): StaleSeenSweep {
  const seen = loadSeenOrders();
  const working = selectWorkingOrders(seen);
  if (working.length === 0) {
    return { canceled: 0, remainingWorking: 0 };
  }
  const next = markCanceled(seen, working);
  persistSeenOrders(next);
  return { canceled: working.length, remainingWorking: remainingWorkingCount(next) };
}
