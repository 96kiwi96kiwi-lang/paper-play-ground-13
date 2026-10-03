/** Refuse a post-only flag the adapters do not forward. Not a halt. */

/**
 * Omitted and false pass. True is refused: placeLimitOrder / placeMarketOrder
 * do not send postOnly, so the order would rest or take as a normal order.
 * A non-boolean is a bad shape. This is a maker floor, not a halt.
 */
export function postOnlyReason(postOnly: unknown): string | null {
  if (postOnly == null || postOnly === false) return null;
  if (postOnly === true) {
    return "Post-only is not supported; the adapter would place a normal order";
  }
  return "Post-only must be omitted or false";
}
