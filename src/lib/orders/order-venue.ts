/** Refuse order-venue text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present venue, orderVenue, or
 * clientVenue is refused: placeLimitOrder / placeMarketOrder do not set an
 * order venue or client venue, so a venue intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderVenueReason(
  venue?: unknown,
  orderVenue?: unknown,
  clientVenue?: unknown,
): string | null {
  if (present(venue)) {
    return "Order venue is not supported; the adapter would place a plain spot order";
  }
  if (present(orderVenue)) {
    return "Order venue alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientVenue)) {
    return "Client venue alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
