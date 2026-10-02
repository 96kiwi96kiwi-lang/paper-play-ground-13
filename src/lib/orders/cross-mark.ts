/** Refuse a limit that would cross or touch the mark. Not a halt. */

/**
 * A buy limit at or above the mark, and a sell limit at or below it, would
 * take instead of rest. Market submits, a missing mark, and a disabled floor
 * still pass. The limit-price band already requires a positive mark on limits.
 */
export function crossMarkReason(
  type: "market" | "limit",
  side: "buy" | "sell",
  symbol: string,
  limitPrice: number | undefined,
  markPrice: number | undefined,
  block: boolean,
): string | null {
  if (!block || type !== "limit") return null;
  if (!(limitPrice && limitPrice > 0) || !(markPrice && markPrice > 0)) return null;
  if (side === "buy" && limitPrice >= markPrice) {
    return `Cross mark (${symbol}): buy limit ${limitPrice} is at or above mark ${markPrice}`;
  }
  if (side === "sell" && limitPrice <= markPrice) {
    return `Cross mark (${symbol}): sell limit ${limitPrice} is at or below mark ${markPrice}`;
  }
  return null;
}
