/** Refuse order-scope text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present scope, orderScope, or
 * clientScope is refused: placeLimitOrder / placeMarketOrder do not set an
 * order scope or client scope, so a scope intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderScopeReason(
  scope?: unknown,
  orderScope?: unknown,
  clientScope?: unknown,
): string | null {
  if (present(scope)) {
    return "Order scope is not supported; the adapter would place a plain spot order";
  }
  if (present(orderScope)) {
    return "Order scope alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientScope)) {
    return "Client scope alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
