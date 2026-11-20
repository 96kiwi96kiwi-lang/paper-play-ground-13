/** Refuse external ambition metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present ambition, ambitionId, or
 * orderAmbition is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach an ambition or narrative tag. An ambition
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

export function orderAmbitionReason(
  ambition: unknown,
  ambitionId?: unknown,
  orderAmbition?: unknown,
): string | null {
  if (present(ambition)) {
    return "Ambition is not supported; the adapter would place a plain spot order";
  }
  if (present(ambitionId)) {
    return "Ambition id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderAmbition)) {
    return "Order-ambition alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
