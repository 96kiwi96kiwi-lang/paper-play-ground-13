/** Refuse a buy when this symbol already has too many trailing accepted buys. Not a halt. */

const COUNTED = new Set(["pending", "open", "partially_filled", "closed", "filled"]);

type BookOrder = {
  side?: string;
  symbol?: string;
  status?: string;
  timestamp?: number;
};

function isAccepted(order: BookOrder): boolean {
  return COUNTED.has(String(order.status ?? ""));
}

/** Trailing accepted buys on a symbol since the last accepted sell. */
export function trailingAcceptedBuys(orders: BookOrder[], symbol: string): number {
  const rows = orders
    .filter((order) => order.symbol === symbol && isAccepted(order))
    .slice()
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
  let streak = 0;
  for (const order of rows) {
    if (order.side === "sell") streak = 0;
    else if (order.side === "buy") streak += 1;
  }
  return streak;
}

export function consecutiveBuysReason(
  side: "buy" | "sell",
  symbol: string,
  trailingBuys: number,
  cap: number,
): string | null {
  if (side !== "buy") return null;
  if (!(cap > 0)) return null;
  const booked = Number.isFinite(trailingBuys) && trailingBuys > 0 ? trailingBuys : 0;
  if (booked >= cap) {
    return `Consecutive buys (${symbol}): ${booked} accepted buys since the last sell (cap ${cap})`;
  }
  return null;
}
