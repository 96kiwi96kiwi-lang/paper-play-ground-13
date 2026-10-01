/** Refuse a same-side submit too soon after the last accepted order on that symbol and side. Not a halt. */

import type { Side, UnifiedOrder } from "@/lib/exchange/types";

const ACCEPTED = new Set(["pending", "open", "partially_filled", "closed", "filled"]);

export function lastAcceptedSameSide(
  seen: UnifiedOrder[],
  symbol: string,
  side: Side,
): UnifiedOrder | undefined {
  let latest: UnifiedOrder | undefined;
  for (const order of seen) {
    if (order.symbol !== symbol) continue;
    if (order.side !== side) continue;
    if (!ACCEPTED.has(String(order.status))) continue;
    if (!latest || order.timestamp > latest.timestamp) latest = order;
  }
  return latest;
}

export function sameSideCooldownReason(
  symbol: string,
  side: Side,
  seen: UnifiedOrder[],
  now: number,
  cooldownMs: number,
): string | null {
  if (!(cooldownMs > 0)) return null;
  const last = lastAcceptedSameSide(seen, symbol, side);
  if (!last) return null;
  const age = now - last.timestamp;
  if (!Number.isFinite(age) || age >= cooldownMs) return null;
  const wait = Math.max(0, Math.ceil(cooldownMs - age));
  return `Same-side cooldown: last ${side} on ${symbol} was ${age}ms ago; wait ${wait}ms`;
}
