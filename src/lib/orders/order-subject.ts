/** Refuse external subject metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present subject, orderSubject, or
 * clientSubject is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a subject or order subject. A subject intent
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

export function orderSubjectReason(
  subject: unknown,
  orderSubject?: unknown,
  clientSubject?: unknown,
): string | null {
  if (present(subject)) {
    return "Subject is not supported; the adapter would place a plain spot order";
  }
  if (present(orderSubject)) {
    return "Order subject is not supported; the adapter would place a plain spot order";
  }
  if (present(clientSubject)) {
    return "Client subject is not supported; the adapter would place a plain spot order";
  }
  return null;
}
