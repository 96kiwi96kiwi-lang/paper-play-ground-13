/** Refuse order-shape flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present shape, orderShape, or
 * clientShape is refused: placeLimitOrder / placeMarketOrder do not set an
 * order shape, so a shape intent would be ignored and the order would rest or
 * fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderShapeReason(
  shape?: unknown,
  orderShape?: unknown,
  clientShape?: unknown,
): string | null {
  if (present(shape)) {
    return "Order shape is not supported; the adapter would place a plain spot order";
  }
  if (present(orderShape)) {
    return "Order shape alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientShape)) {
    return "Client shape alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
