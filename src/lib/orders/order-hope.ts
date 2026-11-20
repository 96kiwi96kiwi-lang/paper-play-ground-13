/** Refuse external hope metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present hope, hopeId, or
 * orderHope is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a hope or narrative tag. A hope
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

export function orderHopeReason(
  hope: unknown,
  hopeId?: unknown,
  orderHope?: unknown,
): string | null {
  if (present(hope)) {
    return "Hope is not supported; the adapter would place a plain spot order";
  }
  if (present(hopeId)) {
    return "Hope id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderHope)) {
    return "Order-hope alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
