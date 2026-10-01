/** Count accepted orders on the local book for a UTC day. Not a halt. */

import { utcDayKeyFromTs } from "./daily-buy-notional";

const COUNTED = new Set(["pending", "open", "partially_filled", "closed", "filled"]);

type CountedOrder = {
  side?: string;
  symbol?: string;
  status?: string;
  timestamp?: number;
};

function isAcceptedOnUtcDay(order: CountedOrder, day: string): boolean {
  const status = String(order.status ?? "");
  if (!COUNTED.has(status)) return false;
  const ts = order.timestamp;
  if (ts == null || !Number.isFinite(ts)) return false;
  return utcDayKeyFromTs(ts) === day;
}

export function acceptedTradeCountOnUtcDay(orders: CountedOrder[], now: number): number {
  const day = utcDayKeyFromTs(now);
  let n = 0;
  for (const order of orders) {
    if (isAcceptedOnUtcDay(order, day)) n += 1;
  }
  return n;
}

export function acceptedTradeCountOnUtcDayForSymbol(
  orders: CountedOrder[],
  symbol: string,
  now: number,
): number {
  const day = utcDayKeyFromTs(now);
  let n = 0;
  for (const order of orders) {
    if (order.symbol !== symbol) continue;
    if (isAcceptedOnUtcDay(order, day)) n += 1;
  }
  return n;
}

export function dailyTradeCapPerSymbolReason(
  symbol: string,
  bookedToday: number,
  cap: number,
): string | null {
  if (!(cap > 0)) return null;
  const booked = Number.isFinite(bookedToday) && bookedToday > 0 ? bookedToday : 0;
  if (booked >= cap) {
    return `Daily trade cap (${symbol}): ${booked}/${cap} accepted today`;
  }
  return null;
}
