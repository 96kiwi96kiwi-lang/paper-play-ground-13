/**
 * Paper-only bookkeeping: mark persisted working orders stale as canceled.
 * Does not call KuCoin, invent quotes, or flatten positions.
 */

import { TRADING_CONFIG } from "@/config/trading";
import { selectStaleOpenOrders } from "@/lib/orders/stale-open";
import { loadSeenOrders, persistSeenOrders } from "./persist";

export type StaleSeenSweep = {
  canceled: number;
  remainingWorking: number;
};

export function cancelStaleSeenOrdersOnDisk(now = Date.now()): StaleSeenSweep {
  const seen = loadSeenOrders();
  const stale = selectStaleOpenOrders(seen, now, TRADING_CONFIG.orders.staleOpenOrderMs);
  if (stale.length === 0) {
    const working = seen.filter((o) => {
      const s = String(o.status);
      return s === "open" || s === "partially_filled" || s === "pending";
    });
    return { canceled: 0, remainingWorking: working.length };
  }
  const staleIds = new Set(stale.map((o) => o.id));
  const next = seen.map((order) => {
    if (!staleIds.has(order.id)) return order;
    return {
      ...order,
      status: "canceled",
      remaining: order.remaining ?? Math.max(0, order.amount - (order.filled ?? 0)),
    };
  });
  persistSeenOrders(next);
  const remainingWorking = next.filter((o) => {
    const s = String(o.status);
    return s === "open" || s === "partially_filled" || s === "pending";
  }).length;
  return { canceled: stale.length, remainingWorking };
}
