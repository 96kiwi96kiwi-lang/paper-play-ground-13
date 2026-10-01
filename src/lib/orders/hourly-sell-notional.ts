/** Sum accepted sell notional on the local book inside a rolling window. Not a halt. */

function orderNotional(order: {
  cost?: number;
  amount?: number;
  filled?: number;
  remaining?: number;
  price?: number;
}): number {
  if (order.cost && order.cost > 0) return order.cost;
  const qty =
    (order.filled && order.filled > 0 ? order.filled : 0) +
    (order.remaining && order.remaining > 0
      ? order.remaining
      : Math.max(0, (order.amount ?? 0) - (order.filled ?? 0)));
  const px = order.price && order.price > 0 ? order.price : 0;
  return qty * px;
}

const COUNTED = new Set(["pending", "open", "partially_filled", "closed", "filled"]);

type CountedOrder = {
  side?: string;
  symbol?: string;
  status?: string;
  timestamp?: number;
  cost?: number;
  amount?: number;
  filled?: number;
  remaining?: number;
  price?: number;
};

function isAcceptedSellInWindow(order: CountedOrder, now: number, windowMs: number): boolean {
  if (order.side !== "sell") return false;
  const status = String(order.status ?? "");
  if (!COUNTED.has(status)) return false;
  const ts = order.timestamp;
  if (ts == null || !Number.isFinite(ts) || !(windowMs > 0)) return false;
  const age = now - ts;
  return age >= 0 && age <= windowMs;
}

export function acceptedSellNotionalInWindow(
  orders: CountedOrder[],
  now: number,
  windowMs: number,
): number {
  let sum = 0;
  for (const order of orders) {
    if (!isAcceptedSellInWindow(order, now, windowMs)) continue;
    const n = orderNotional(order);
    if (n > 0) sum += n;
  }
  return sum;
}

export function acceptedSellNotionalInWindowForSymbol(
  orders: CountedOrder[],
  symbol: string,
  now: number,
  windowMs: number,
): number {
  let sum = 0;
  for (const order of orders) {
    if (order.symbol !== symbol) continue;
    if (!isAcceptedSellInWindow(order, now, windowMs)) continue;
    const n = orderNotional(order);
    if (n > 0) sum += n;
  }
  return sum;
}

export function hourlySellNotionalReason(
  side: "buy" | "sell",
  thisNotional: number | undefined,
  bookedWindowUsd: number,
  capUsd: number,
): string | null {
  if (side !== "sell") return null;
  if (!(capUsd > 0)) return null;
  const booked = Number.isFinite(bookedWindowUsd) && bookedWindowUsd > 0 ? bookedWindowUsd : 0;
  if (thisNotional == null || !Number.isFinite(thisNotional)) {
    if (booked >= capUsd) {
      return `Hourly sell notional: booked $${booked.toFixed(2)} already at cap $${capUsd}`;
    }
    return null;
  }
  const next = booked + thisNotional;
  if (next > capUsd + 1e-9) {
    return `Hourly sell notional: $${next.toFixed(2)} would exceed cap $${capUsd} (booked in window $${booked.toFixed(2)})`;
  }
  return null;
}

export function hourlySellNotionalPerSymbolReason(
  side: "buy" | "sell",
  symbol: string,
  thisNotional: number | undefined,
  bookedWindowUsd: number,
  capUsd: number,
): string | null {
  if (side !== "sell") return null;
  if (!(capUsd > 0)) return null;
  const booked = Number.isFinite(bookedWindowUsd) && bookedWindowUsd > 0 ? bookedWindowUsd : 0;
  if (thisNotional == null || !Number.isFinite(thisNotional)) {
    if (booked >= capUsd) {
      return `Hourly sell notional (${symbol}): booked $${booked.toFixed(2)} already at cap $${capUsd}`;
    }
    return null;
  }
  const next = booked + thisNotional;
  if (next > capUsd + 1e-9) {
    return `Hourly sell notional (${symbol}): $${next.toFixed(2)} would exceed cap $${capUsd} (booked in window $${booked.toFixed(2)})`;
  }
  return null;
}
