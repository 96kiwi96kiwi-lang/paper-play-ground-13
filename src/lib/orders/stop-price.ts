/** Refuse a stop price the adapters do not forward. Not a halt. */

/**
 * Omitted, null, and blank pass. Any present stop price is refused:
 * placeLimitOrder / placeMarketOrder do not send stopPrice, so the order
 * would fill or rest immediately instead of waiting for a trigger.
 * This is a trigger floor, not a halt, and does not flatten positions.
 */
export function stopPriceReason(stopPrice: unknown): string | null {
  if (stopPrice == null) return null;
  if (typeof stopPrice === "string" && stopPrice.trim() === "") return null;
  return "Stop price is not supported; the adapter would place a normal order";
}
