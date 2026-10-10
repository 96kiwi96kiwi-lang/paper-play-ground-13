/** Refuse order-group flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present group, orderGroup, or
 * clientGroup is refused: placeLimitOrder / placeMarketOrder do not set an
 * order group, so a group intent would be ignored and the order would rest or
 * fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderGroupReason(
  group?: unknown,
  orderGroup?: unknown,
  clientGroup?: unknown,
): string | null {
  if (present(group)) {
    return "Order group is not supported; the adapter would place a plain spot order";
  }
  if (present(orderGroup)) {
    return "Order group alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientGroup)) {
    return "Client group alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
