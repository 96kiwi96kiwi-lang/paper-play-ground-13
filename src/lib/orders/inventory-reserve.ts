/** Refuse sells that would spend units already reserved by working sell orders. Not a halt. */

export function workingSellReservedAmount(
  symbol: string,
  orders: Array<{
    symbol?: string;
    side?: string;
    status?: string;
    amount?: number;
    filled?: number;
    remaining?: number;
  }>,
): number {
  let reserved = 0;
  for (const order of orders) {
    if (order.symbol !== symbol) continue;
    if (order.side !== "sell") continue;
    const status = String(order.status ?? "");
    if (status !== "open" && status !== "partially_filled" && status !== "pending") continue;
    const remaining =
      order.remaining ?? Math.max(0, (order.amount ?? 0) - (order.filled ?? 0));
    if (remaining > 0) reserved += remaining;
  }
  return reserved;
}

export function inventoryReserveSellReason(
  side: "buy" | "sell",
  held: number,
  amount: number,
  reservedSellAmount = 0,
  symbol = "",
): string | null {
  if (side !== "sell") return null;
  if (!(amount > 0) || !Number.isFinite(amount)) return null;
  const reserved =
    Number.isFinite(reservedSellAmount) && reservedSellAmount > 0 ? reservedSellAmount : 0;
  const available = held - reserved;
  if (available + 1e-12 < amount) {
    const label = symbol ? ` of ${symbol}` : "";
    return `Inventory: cannot sell ${amount}${label} (held ${held}, reserved working sells ${reserved})`;
  }
  return null;
}
