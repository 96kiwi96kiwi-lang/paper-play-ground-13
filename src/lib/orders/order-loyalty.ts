/** Refuse external loyalty metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present loyalty, loyaltyId, or
 * orderLoyalty is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a loyalty or narrative tag. A loyalty
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

export function orderLoyaltyReason(
  loyalty: unknown,
  loyaltyId?: unknown,
  orderLoyalty?: unknown,
): string | null {
  if (present(loyalty)) {
    return "Loyalty is not supported; the adapter would place a plain spot order";
  }
  if (present(loyaltyId)) {
    return "Loyalty id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderLoyalty)) {
    return "Order-loyalty alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
