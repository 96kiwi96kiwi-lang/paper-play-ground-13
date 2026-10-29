/** Refuse order-urgency text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present urgency, orderUrgency, or
 * clientUrgency is refused: placeLimitOrder / placeMarketOrder do not set an
 * order urgency or client urgency, so an urgency intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderUrgencyReason(
  urgency?: unknown,
  orderUrgency?: unknown,
  clientUrgency?: unknown,
): string | null {
  if (present(urgency)) {
    return "Order urgency is not supported; the adapter would place a plain spot order";
  }
  if (present(orderUrgency)) {
    return "Order urgency alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientUrgency)) {
    return "Client urgency alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
