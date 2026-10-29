/** Refuse order-audience text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present audience, orderAudience, or
 * clientAudience is refused: placeLimitOrder / placeMarketOrder do not set an
 * order audience or client audience, so an audience intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderAudienceReason(
  audience?: unknown,
  orderAudience?: unknown,
  clientAudience?: unknown,
): string | null {
  if (present(audience)) {
    return "Order audience is not supported; the adapter would place a plain spot order";
  }
  if (present(orderAudience)) {
    return "Order audience alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientAudience)) {
    return "Client audience alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
