/** Refuse external assurance metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present assurance, assuranceId, or
 * orderAssurance is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach an assurance or narrative tag. An assurance
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

export function orderAssuranceReason(
  assurance: unknown,
  assuranceId?: unknown,
  orderAssurance?: unknown,
): string | null {
  if (present(assurance)) {
    return "Assurance is not supported; the adapter would place a plain spot order";
  }
  if (present(assuranceId)) {
    return "Assurance id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderAssurance)) {
    return "Order-assurance alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
