/** Refuse good-till-time aliases the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present goodTillTime, gtd, or
 * expireAt is refused: placeLimitOrder / placeMarketOrder do not send an
 * expiry, so a good-till-time intent would be ignored and the order would
 * rest until a later cancel. Zero is present and is refused. cancelAfter,
 * expireTime, and goodTillDate remain their own floor. This is an expiry
 * alias floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function goodTillTimeReason(
  goodTillTime: unknown,
  gtd?: unknown,
  expireAt?: unknown,
): string | null {
  if (present(goodTillTime)) {
    return "Good till time is not supported; the adapter would rest the order";
  }
  if (present(gtd)) {
    return "GTD is not supported; the adapter would rest the order";
  }
  if (present(expireAt)) {
    return "Expire-at is not supported; the adapter would rest the order";
  }
  return null;
}
