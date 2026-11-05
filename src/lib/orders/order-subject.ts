/** Refuse order-subject flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present subject, orderSubject, or
 * clientSubject is refused: placeLimitOrder / placeMarketOrder do not set an
 * order subject, so a subject intent would be ignored and the order would rest or
 * fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderSubjectReason(
  subject?: unknown,
  orderSubject?: unknown,
  clientSubject?: unknown,
): string | null {
  if (present(subject)) {
    return "Order subject is not supported; the adapter would place a plain spot order";
  }
  if (present(orderSubject)) {
    return "Order subject alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientSubject)) {
    return "Client subject alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
