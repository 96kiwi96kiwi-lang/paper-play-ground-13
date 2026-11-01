/** Refuse urgency fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present urgency, orderUrgency,
 * or clientUrgency is refused: adapters place one plain spot order and do
 * not attach an urgency, so an urgency-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderUrgencyReason(
  urgency: unknown,
  orderUrgency?: unknown,
  clientUrgency?: unknown,
): string | null {
  if (present(urgency)) {
    return "Urgency is not supported; the adapter would place a plain spot order";
  }
  if (present(orderUrgency)) {
    return "Order urgency is not supported; the adapter would place a plain spot order";
  }
  if (present(clientUrgency)) {
    return "Client urgency is not supported; the adapter would place a plain spot order";
  }
  return null;
}
