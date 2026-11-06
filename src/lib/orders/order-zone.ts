/** Refuse order-zone text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present zone, orderZone, or
 * clientZone is refused: placeLimitOrder / placeMarketOrder do not set an
 * order zone or client zone, so a zone intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderZoneReason(
  zone?: unknown,
  orderZone?: unknown,
  clientZone?: unknown,
): string | null {
  if (present(zone)) {
    return "Order zone is not supported; the adapter would place a plain spot order";
  }
  if (present(orderZone)) {
    return "Order zone alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientZone)) {
    return "Client zone alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
