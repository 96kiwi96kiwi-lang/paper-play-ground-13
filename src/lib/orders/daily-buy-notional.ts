/** Sum accepted buy notional on the local book for a UTC day. Not a halt. */

export function utcDayKeyFromTs(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

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

function isAcceptedBuyOnUtcDay(order: CountedOrder, day: string): boolean {
  if (order.side !== "buy") return false;
  const status = String(order.status ?? "");
  if (!COUNTED.has(status)) return false;
  const ts = order.timestamp;
  if (ts == null || !Number.isFinite(ts)) return false;
  return utcDayKeyFromTs(ts) === day;
}

export function acceptedBuyNotionalOnUtcDay(orders: CountedOrder[], now: number): number {
  const day = utcDayKeyFromTs(now);
  let sum = 0;
  for (const order of orders) {
    if (!isAcceptedBuyOnUtcDay(order, day)) continue;
    const n = orderNotional(order);
    if (n > 0) sum += n;
  }
  return sum;
}

export function acceptedBuyNotionalOnUtcDayForSymbol(
  orders: CountedOrder[],
  symbol: string,
  now: number,
): number {
  const day = utcDayKeyFromTs(now);
  let sum = 0;
  for (const order of orders) {
    if (order.symbol !== symbol) continue;
    if (!isAcceptedBuyOnUtcDay(order, day)) continue;
    const n = orderNotional(order);
    if (n > 0) sum += n;
  }
  return sum;
}

export function dailyBuyNotionalReason(
  side: "buy" | "sell",
  thisNotional: number | undefined,
  bookedTodayUsd: number,
  capUsd: number,
): string | null {
  if (side !== "buy") return null;
  if (!(capUsd > 0)) return null;
  const booked = Number.isFinite(bookedTodayUsd) && bookedTodayUsd > 0 ? bookedTodayUsd : 0;
  if (thisNotional == null || !Number.isFinite(thisNotional)) {
    if (booked >= capUsd) {
      return `Daily buy notional: booked $${booked.toFixed(2)} already at cap $${capUsd}`;
    }
    return null;
  }
  const next = booked + thisNotional;
  if (next > capUsd + 1e-9) {
    return `Daily buy notional: $${next.toFixed(2)} would exceed cap $${capUsd} (booked today $${booked.toFixed(2)})`;
  }
  return null;
}

export function dailyBuyNotionalPerSymbolReason(
  side: "buy" | "sell",
  symbol: string,
  thisNotional: number | undefined,
  bookedTodayUsd: number,
  capUsd: number,
): string | null {
  if (side !== "buy") return null;
  if (!(capUsd > 0)) return null;
  const booked = Number.isFinite(bookedTodayUsd) && bookedTodayUsd > 0 ? bookedTodayUsd : 0;
  if (thisNotional == null || !Number.isFinite(thisNotional)) {
    if (booked >= capUsd) {
      return `Daily buy notional (${symbol}): booked $${booked.toFixed(2)} already at cap $${capUsd}`;
    }
    return null;
  }
  const next = booked + thisNotional;
  if (next > capUsd + 1e-9) {
    return `Daily buy notional (${symbol}): $${next.toFixed(2)} would exceed cap $${capUsd} (booked today $${booked.toFixed(2)})`;
  }
  return null;
}
