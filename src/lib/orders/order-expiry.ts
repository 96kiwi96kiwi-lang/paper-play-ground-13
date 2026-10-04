/** Refuse expiry fields the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, and blank pass. A present cancel-after, expire time, or
 * good-till date is refused: placeLimitOrder / placeMarketOrder do not send
 * these fields, so the order would rest until a later cancel instead of
 * expiring. Zero is present and is refused. GTT time-in-force remains its
 * own floor. This is an expiry floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderExpiryReason(
  cancelAfter: unknown,
  expireTime?: unknown,
  goodTillDate?: unknown,
): string | null {
  if (present(cancelAfter)) {
    return "Cancel after is not supported; the adapter would rest the order";
  }
  if (present(expireTime)) {
    return "Expire time is not supported; the adapter would rest the order";
  }
  if (present(goodTillDate)) {
    return "Good till date is not supported; the adapter would rest the order";
  }
  return null;
}
