/** Refuse external session metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present session, orderSession, or
 * clientSession is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a session or order session. A session intent
 * would otherwise be dropped and the order would rest or fill as a plain spot
 * order. Zero is present and is refused. This is a metadata floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderSessionReason(
  session: unknown,
  orderSession?: unknown,
  clientSession?: unknown,
): string | null {
  if (present(session)) {
    return "Session is not supported; the adapter would place a plain spot order";
  }
  if (present(orderSession)) {
    return "Order session is not supported; the adapter would place a plain spot order";
  }
  if (present(clientSession)) {
    return "Client session is not supported; the adapter would place a plain spot order";
  }
  return null;
}
