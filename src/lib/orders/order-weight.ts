/** Refuse order-weight text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present weight, orderWeight, or
 * clientWeight is refused: placeLimitOrder / placeMarketOrder do not set an
 * order weight or client weight, so a weight intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderWeightReason(
  weight?: unknown,
  orderWeight?: unknown,
  clientWeight?: unknown,
): string | null {
  if (present(weight)) {
    return "Order weight is not supported; the adapter would place a plain spot order";
  }
  if (present(orderWeight)) {
    return "Order weight alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientWeight)) {
    return "Client weight alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
