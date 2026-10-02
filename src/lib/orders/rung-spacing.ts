/** Refuse a limit that would sit tighter than one grid rung. Not a halt. */

type WorkingOrder = {
  id?: string;
  side?: string;
  symbol?: string;
  price?: number;
};

/**
 * A limit is refused when a working order on the same side and symbol already
 * rests strictly closer than `minSpacingPct`. A rung at exactly that spacing
 * still passes, so the designed adjacent level is allowed. Market submits (no
 * limit price), other symbols, opposite side, and a disabled floor still pass.
 * Closed rows are not in `working`. The same-price band is narrower and only
 * stops a near-duplicate price.
 */
export function rungSpacingReason(
  side: "buy" | "sell",
  symbol: string,
  limitPrice: number | undefined,
  working: WorkingOrder[],
  minSpacingPct: number,
  block: boolean,
): string | null {
  if (!block) return null;
  if (!(limitPrice && limitPrice > 0) || !(minSpacingPct > 0)) return null;
  const hit = working.find((order) => {
    if (order.symbol !== symbol || order.side !== side) return false;
    if (!(order.price && order.price > 0)) return false;
    const distPct = (Math.abs(order.price - limitPrice) / order.price) * 100;
    return distPct < minSpacingPct;
  });
  if (!hit) return null;
  const id = hit.id ? ` ${hit.id}` : "";
  const resting = hit.price ?? limitPrice;
  const distPct = (Math.abs(resting - limitPrice) / resting) * 100;
  return `Tight rung (${symbol}): working ${side}${id} at ${resting} is ${distPct.toFixed(2)}% from ${limitPrice} (min ${minSpacingPct}%)`;
}
