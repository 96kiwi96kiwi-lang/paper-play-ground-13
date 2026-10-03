/** Refuse a reduce-only flag the adapters do not forward. Not a halt. */

/**
 * Omitted and false pass. True is refused: placeLimitOrder / placeMarketOrder
 * do not send reduceOnly, so the order would open or add instead of only closing.
 * A non-boolean is a bad shape. This is a close-only floor, not a halt.
 */
export function reduceOnlyReason(reduceOnly: unknown): string | null {
  if (reduceOnly == null || reduceOnly === false) return null;
  if (reduceOnly === true) {
    return "Reduce-only is not supported; the adapter would place a normal order";
  }
  return "Reduce-only must be omitted or false";
}
