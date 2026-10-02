/** Refuse a buy that chases a recent accepted fill higher. Not a halt. */

const COUNTED = new Set(["pending", "open", "partially_filled", "closed", "filled"]);

type BookOrder = {
  side?: string;
  symbol?: string;
  status?: string;
  timestamp?: number;
  price?: number;
  filled?: number;
  cost?: number;
};

export type LastBuyFill = {
  price: number;
  timestamp: number;
};

function isAccepted(order: BookOrder): boolean {
  return COUNTED.has(String(order.status ?? ""));
}

function fillPrice(order: BookOrder): number | null {
  if (order.price != null && order.price > 0) return order.price;
  const filled = order.filled ?? 0;
  const cost = order.cost ?? 0;
  if (filled > 0 && cost > 0) return cost / filled;
  return null;
}

/** Latest accepted buy on this symbol that has a positive fill price. */
export function lastAcceptedBuyFill(orders: BookOrder[], symbol: string): LastBuyFill | null {
  let best: LastBuyFill | null = null;
  for (const order of orders) {
    if (order.symbol !== symbol || order.side !== "buy" || !isAccepted(order)) continue;
    const price = fillPrice(order);
    const timestamp = order.timestamp ?? 0;
    if (price == null || !(timestamp > 0)) continue;
    if (!best || timestamp >= best.timestamp) best = { price, timestamp };
  }
  return best;
}

/**
 * A buy is refused when the mark is at least maxPct above the latest accepted
 * buy fill on that symbol and that fill is still inside windowMs. Sells, other
 * symbols, stale fills, and submits without a positive mark are unchanged.
 */
export function chaseUpReason(
  side: "buy" | "sell",
  symbol: string,
  mark: number | undefined,
  lastBuy: LastBuyFill | null,
  now: number,
  windowMs: number,
  maxPct: number,
): string | null {
  if (side !== "buy") return null;
  if (!(maxPct > 0) || !(windowMs > 0)) return null;
  if (!lastBuy || !(lastBuy.price > 0) || !(lastBuy.timestamp > 0)) return null;
  if (mark == null || !(mark > 0)) return null;
  const age = now - lastBuy.timestamp;
  if (age < 0 || age > windowMs) return null;
  const upPct = ((mark - lastBuy.price) / lastBuy.price) * 100;
  if (upPct + 1e-9 >= maxPct) {
    return `Chase up (${symbol}): mark is ${upPct.toFixed(2)}% above last buy ${lastBuy.price} (max ${maxPct}% inside ${windowMs}ms)`;
  }
  return null;
}
