/** Refuse order-overview fields the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present overview, orderOverview, or
 * clientOverview is refused: placeLimitOrder / placeMarketOrder do not set an
 * order overview, so an overview intent would be ignored and the order would
 * rest or fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderOverviewReason(
  overview?: unknown,
  orderOverview?: unknown,
  clientOverview?: unknown,
): string | null {
  if (present(overview)) {
    return "Order overview is not supported; the adapter would place a plain spot order";
  }
  if (present(orderOverview)) {
    return "Order overview alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientOverview)) {
    return "Client overview alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
