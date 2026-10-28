/** Refuse order-origin flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present origin, orderOrigin, or
 * clientOrigin is refused: placeLimitOrder / placeMarketOrder do not set an
 * order origin, so an origin-tracking intent would be ignored and the order
 * would rest or fill as a plain spot order. Zero is present and is refused.
 * This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderOriginReason(
  origin?: unknown,
  orderOrigin?: unknown,
  clientOrigin?: unknown,
): string | null {
  if (present(origin)) {
    return "Order origin is not supported; the adapter would place a plain spot order";
  }
  if (present(orderOrigin)) {
    return "Order origin alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientOrigin)) {
    return "Client origin alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
