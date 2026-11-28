/** Refuse external allegiance metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present allegiance, allegianceId, or
 * orderAllegiance is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach an allegiance or narrative tag. An allegiance
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

export function orderAllegianceReason(
  allegiance: unknown,
  allegianceId?: unknown,
  orderAllegiance?: unknown,
): string | null {
  if (present(allegiance)) {
    return "Allegiance is not supported; the adapter would place a plain spot order";
  }
  if (present(allegianceId)) {
    return "Allegiance id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderAllegiance)) {
    return "Order-allegiance alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
