/** Refuse order-session flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present session, orderSession, or
 * clientSession is refused: placeLimitOrder / placeMarketOrder do not set an
 * order session, so a session intent would be ignored and the order would
 * rest or fill as a plain spot order. Zero is present and is refused.
 * This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderSessionReason(
  session?: unknown,
  orderSession?: unknown,
  clientSession?: unknown,
): string | null {
  if (present(session)) {
    return "Order session is not supported; the adapter would place a plain spot order";
  }
  if (present(orderSession)) {
    return "Order session alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientSession)) {
    return "Client session alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
