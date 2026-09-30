import type { UnifiedOrder } from "@/lib/exchange/types";

function isWorking(status: string): boolean {
  return status === "open" || status === "partially_filled" || status === "pending";
}

/**
 * Resting limit / open orders older than maxAgeMs.
 * Market fills (closed) are ignored — they are not cancelable leftovers.
 */
export function selectStaleOpenOrders(
  orders: UnifiedOrder[],
  now: number,
  maxAgeMs: number,
): UnifiedOrder[] {
  return orders.filter((order) => {
    if (!isWorking(String(order.status))) return false;
    if (order.type === "market" && order.filled > 0 && (order.remaining ?? 0) <= 0) {
      return false;
    }
    const ts = Number(order.timestamp);
    if (!Number.isFinite(ts) || ts <= 0) return true;
    return now - ts >= maxAgeMs;
  });
}

/**
 * Every cancelable working order, regardless of age.
 * Used on hard-stop so paper books do not keep resting limits after a halt.
 */
export function selectWorkingOrders(orders: UnifiedOrder[]): UnifiedOrder[] {
  return orders.filter((order) => {
    if (!isWorking(String(order.status))) return false;
    if (order.type === "market" && order.filled > 0 && (order.remaining ?? 0) <= 0) {
      return false;
    }
    return true;
  });
}
