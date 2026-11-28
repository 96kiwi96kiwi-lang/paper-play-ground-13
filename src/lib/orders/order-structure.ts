/** Refuse order-structure flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present structure, orderStructure, or
 * clientStructure is refused: placeLimitOrder / placeMarketOrder do not set an
 * order structure, so a structure intent would be ignored and the order would rest or
 * fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderStructureReason(
  structure?: unknown,
  orderStructure?: unknown,
  clientStructure?: unknown,
): string | null {
  if (present(structure)) {
    return "Order structure is not supported; the adapter would place a plain spot order";
  }
  if (present(orderStructure)) {
    return "Order structure alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientStructure)) {
    return "Client structure alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
