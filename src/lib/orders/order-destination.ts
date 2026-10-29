/** Refuse order-destination text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present destination, orderDestination,
 * or clientDestination is refused: placeLimitOrder / placeMarketOrder do not set
 * an order destination or client destination, so a destination intent would be
 * ignored and the order would rest or fill as a plain spot order. Zero is present
 * and is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderDestinationReason(
  destination?: unknown,
  orderDestination?: unknown,
  clientDestination?: unknown,
): string | null {
  if (present(destination)) {
    return "Order destination is not supported; the adapter would place a plain spot order";
  }
  if (present(orderDestination)) {
    return "Order destination alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientDestination)) {
    return "Client destination alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
