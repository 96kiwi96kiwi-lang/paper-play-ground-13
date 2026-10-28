/** Refuse external user metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present user, orderUser, or
 * clientUser is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a user or order user. A user intent
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

export function orderUserReason(
  user: unknown,
  orderUser?: unknown,
  clientUser?: unknown,
): string | null {
  if (present(user)) {
    return "User is not supported; the adapter would place a plain spot order";
  }
  if (present(orderUser)) {
    return "Order user is not supported; the adapter would place a plain spot order";
  }
  if (present(clientUser)) {
    return "Client user is not supported; the adapter would place a plain spot order";
  }
  return null;
}
