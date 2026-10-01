/** Refuse when resting working orders plus this submit exceed the notional sleeve. Not a halt. */

export type WorkingNotionalOrder = {
  symbol?: string;
  side?: string;
  status?: string;
  amount?: number;
  filled?: number;
  remaining?: number;
  price?: number;
  cost?: number;
};

function remainingAmount(order: WorkingNotionalOrder): number {
  const remaining =
    order.remaining ?? Math.max(0, (order.amount ?? 0) - (order.filled ?? 0));
  return remaining > 0 && Number.isFinite(remaining) ? remaining : 0;
}

function orderNotional(order: WorkingNotionalOrder): number {
  const remaining = remainingAmount(order);
  if (!(remaining > 0)) return 0;
  const px = order.price && order.price > 0 ? order.price : 0;
  const fromPx = remaining * px;
  if (fromPx > 0) return fromPx;
  const amount = order.amount ?? 0;
  if ((order.cost ?? 0) > 0 && amount > 0) {
    return ((order.cost ?? 0) * remaining) / amount;
  }
  return 0;
}

function isWorking(order: WorkingNotionalOrder): boolean {
  const status = String(order.status ?? "");
  return status === "open" || status === "partially_filled" || status === "pending";
}

/** Remaining notional on working orders (buy and sell). Closed, rejected, and canceled rows are ignored. */
export function workingNotionalUsd(orders: WorkingNotionalOrder[]): number {
  let booked = 0;
  for (const order of orders) {
    if (!isWorking(order)) continue;
    const n = orderNotional(order);
    if (n > 0) booked += n;
  }
  return booked;
}

/** Remaining notional on working orders for one symbol. Other pairs are ignored. */
export function workingNotionalUsdForSymbol(
  orders: WorkingNotionalOrder[],
  symbol: string,
): number {
  return workingNotionalUsd(orders.filter((order) => order.symbol === symbol));
}

export function workingNotionalReason(
  bookedUsd: number,
  thisNotional: number | undefined,
  capUsd: number,
): string | null {
  if (!(capUsd > 0)) return null;
  const booked = Number.isFinite(bookedUsd) && bookedUsd > 0 ? bookedUsd : 0;
  if (thisNotional == null || !Number.isFinite(thisNotional) || !(thisNotional > 0)) {
    if (booked + 1e-9 >= capUsd) {
      return `Working notional: booked ${booked.toFixed(2)} already at max ${capUsd}`;
    }
    return null;
  }
  const next = booked + thisNotional;
  if (next > capUsd + 1e-9) {
    return `Working notional: ${next.toFixed(2)} would exceed max ${capUsd} (booked ${booked.toFixed(2)})`;
  }
  return null;
}

export function workingNotionalPerSymbolReason(
  symbol: string,
  bookedUsd: number,
  thisNotional: number | undefined,
  capUsd: number,
): string | null {
  const reason = workingNotionalReason(bookedUsd, thisNotional, capUsd);
  if (!reason) return null;
  return reason.replace("Working notional:", `Working notional (${symbol}):`);
}
