/** Refuse a buy shortly after a losing sell on the same symbol. Not a halt. */

const COUNTED = new Set(["pending", "open", "partially_filled", "closed", "filled"]);

type BookOrder = {
  side?: string;
  symbol?: string;
  status?: string;
  timestamp?: number;
  price?: number;
  filled?: number;
  amount?: number;
  cost?: number;
};

function isAccepted(order: BookOrder): boolean {
  return COUNTED.has(String(order.status ?? ""));
}

function fillQty(order: BookOrder): number {
  if (order.filled != null && order.filled > 0) return order.filled;
  if (order.amount != null && order.amount > 0) return order.amount;
  return 0;
}

function fillPx(order: BookOrder, qty: number): number {
  if (order.price != null && order.price > 0) return order.price;
  if (order.cost != null && order.cost > 0 && qty > 0) return order.cost / qty;
  return 0;
}

/**
 * Timestamp of the latest accepted sell whose fill was at least minLossPct
 * below the average entry still open on this symbol's book. Rejects and
 * cancels do not count. Other symbols are ignored.
 */
export function lastLosingSellAt(
  orders: BookOrder[],
  symbol: string,
  minLossPct: number,
): number | null {
  if (!(minLossPct > 0)) return null;
  const rows = orders
    .filter((order) => order.symbol === symbol && isAccepted(order))
    .slice()
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
  let qty = 0;
  let cost = 0;
  let last: number | null = null;
  for (const order of rows) {
    const q = fillQty(order);
    const px = fillPx(order, q);
    if (!(q > 0) || !(px > 0)) continue;
    if (order.side === "buy") {
      qty += q;
      cost += q * px;
    } else if (order.side === "sell" && qty > 1e-12 && cost > 0) {
      const avg = cost / qty;
      const lossPct = ((avg - px) / avg) * 100;
      if (lossPct + 1e-9 >= minLossPct) last = order.timestamp ?? last;
      const sold = Math.min(q, qty);
      qty -= sold;
      cost = Math.max(0, cost - avg * sold);
      if (qty <= 1e-8) {
        qty = 0;
        cost = 0;
      }
    }
  }
  return last;
}

export function lossReentryReason(
  side: "buy" | "sell",
  symbol: string,
  lastLossAt: number | null,
  now: number,
  cooldownMs: number,
): string | null {
  if (side !== "buy") return null;
  if (!(cooldownMs > 0)) return null;
  if (lastLossAt == null || !(lastLossAt > 0)) return null;
  const age = now - lastLossAt;
  if (age < 0) return null;
  if (age < cooldownMs) {
    const wait = Math.ceil(cooldownMs - age);
    return `Loss reentry (${symbol}): buy paused ${wait}ms after a losing sell`;
  }
  return null;
}
