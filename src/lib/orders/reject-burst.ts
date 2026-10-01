/** Refuse new submits after too many adapter rejects in a rolling window. Not a halt. */

import type { UnifiedOrder } from "@/lib/exchange/types";

function inWindow(order: UnifiedOrder, now: number, windowMs: number): boolean {
  if (!(windowMs > 0)) return false;
  if (String(order.status) !== "rejected") return false;
  if (!Number.isFinite(order.timestamp)) return false;
  const age = now - order.timestamp;
  return age >= 0 && age < windowMs;
}

export function rejectedCountInWindow(
  seen: UnifiedOrder[],
  now: number,
  windowMs: number,
): number {
  let count = 0;
  for (const order of seen) {
    if (inWindow(order, now, windowMs)) count += 1;
  }
  return count;
}

export function rejectedCountInWindowForSymbol(
  seen: UnifiedOrder[],
  symbol: string,
  now: number,
  windowMs: number,
): number {
  let count = 0;
  for (const order of seen) {
    if (order.symbol !== symbol) continue;
    if (inWindow(order, now, windowMs)) count += 1;
  }
  return count;
}

export function rejectBurstReason(
  count: number,
  max: number,
  windowMs: number,
): string | null {
  if (!(max > 0) || !(windowMs > 0)) return null;
  if (count < max) return null;
  return `Reject burst: ${count} rejected orders in the last ${windowMs}ms (max ${max})`;
}

export function rejectBurstPerSymbolReason(
  symbol: string,
  count: number,
  max: number,
  windowMs: number,
): string | null {
  if (!(max > 0) || !(windowMs > 0)) return null;
  if (count < max) return null;
  return `Reject burst (${symbol}): ${count} rejected orders in the last ${windowMs}ms (max ${max})`;
}
