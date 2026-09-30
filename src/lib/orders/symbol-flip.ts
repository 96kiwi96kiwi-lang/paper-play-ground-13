/** Refuse an opposite-side submit too soon after the last accepted order on that symbol. Not a halt. */

import type { Side, UnifiedOrder } from "@/lib/exchange/types";

const ACCEPTED = new Set(["pending", "open", "partially_filled", "closed"]);

export function lastAcceptedOnSymbol(
  seen: UnifiedOrder[],
  symbol: string,
): UnifiedOrder | undefined {
  let latest: UnifiedOrder | undefined;
  for (const order of seen) {
    if (order.symbol !== symbol) continue;
    if (!ACCEPTED.has(String(order.status))) continue;
    if (!latest || order.timestamp > latest.timestamp) latest = order;
  }
  return latest;
}

export function symbolFlipCooldownReason(
  symbol: string,
  side: Side,
  seen: UnifiedOrder[],
  now: number,
  cooldownMs: number,
): string | null {
  if (!(cooldownMs > 0)) return null;
  const last = lastAcceptedOnSymbol(seen, symbol);
  if (!last) return null;
  if (last.side === side) return null;
  const age = now - last.timestamp;
  if (age >= cooldownMs) return null;
  const wait = Math.max(0, Math.ceil(cooldownMs - age));
  return `Symbol flip cooldown: last ${last.side} on ${symbol} was ${age}ms ago; wait ${wait}ms`;
}
