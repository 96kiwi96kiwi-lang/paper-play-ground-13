/** Refuse buys that would leave book cash below the configured sleeve. Not a halt. */

export function workingBuyReservedUsd(
  orders: Array<{
    side?: string;
    status?: string;
    amount?: number;
    filled?: number;
    remaining?: number;
    price?: number;
    cost?: number;
  }>,
): number {
  let reserved = 0;
  for (const order of orders) {
    const status = String(order.status ?? "");
    if (order.side !== "buy") continue;
    if (status !== "open" && status !== "partially_filled" && status !== "pending") continue;
    const remaining =
      order.remaining ??
      Math.max(0, (order.amount ?? 0) - (order.filled ?? 0));
    if (!(remaining > 0)) continue;
    const px = order.price && order.price > 0 ? order.price : 0;
    const fromPx = remaining * px;
    if (fromPx > 0) {
      reserved += fromPx;
      continue;
    }
    const leftoverCost =
      (order.cost ?? 0) > 0 && (order.amount ?? 0) > 0
        ? ((order.cost ?? 0) * remaining) / (order.amount ?? 1)
        : 0;
    if (leftoverCost > 0) reserved += leftoverCost;
  }
  return reserved;
}

export function cashReserveBuyReason(
  side: "buy" | "sell",
  cash: number,
  notional: number | undefined,
  reserveUsd: number,
  reservedBuyUsd = 0,
): string | null {
  if (side !== "buy") return null;
  if (!Number.isFinite(cash)) return "Cash reserve: book cash is not finite";
  const reserved = Number.isFinite(reservedBuyUsd) && reservedBuyUsd > 0 ? reservedBuyUsd : 0;
  const available = cash - reserved;
  if (notional == null || !Number.isFinite(notional)) {
    if (available < reserveUsd + 10) {
      return `Cash reserve floor ($${reserveUsd}) — available $${available.toFixed(2)} (reserved $${reserved.toFixed(2)})`;
    }
    return null;
  }
  const leftover = available - notional;
  if (leftover + 1e-9 < reserveUsd) {
    return `Cash reserve: leftover $${leftover.toFixed(2)} would breach $${reserveUsd} (reserved working buys $${reserved.toFixed(2)})`;
  }
  return null;
}
