/** Refuse a limit while a same-side working order already rests near that price. Not a halt. */

type WorkingOrder = {
  id?: string;
  side?: string;
  symbol?: string;
  price?: number;
};

export function samePriceWorkingReason(
  side: "buy" | "sell",
  symbol: string,
  limitPrice: number | undefined,
  working: WorkingOrder[],
  bandPct: number,
  block: boolean,
): string | null {
  if (!block) return null;
  if (!(limitPrice && limitPrice > 0) || !(bandPct > 0)) return null;
  const hit = working.find((order) => {
    if (order.symbol !== symbol || order.side !== side) return false;
    if (!(order.price && order.price > 0)) return false;
    const distPct = (Math.abs(order.price - limitPrice) / order.price) * 100;
    return distPct <= bandPct;
  });
  if (!hit) return null;
  const id = hit.id ? ` ${hit.id}` : "";
  const resting = hit.price ?? limitPrice;
  return `Same price (${symbol}): working ${side}${id} already rests at ${resting}`;
}
