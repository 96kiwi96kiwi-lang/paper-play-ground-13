/** Refuse order-purpose text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present purpose, orderPurpose, or
 * clientPurpose is refused: placeLimitOrder / placeMarketOrder do not set an
 * order purpose or client purpose, so a purpose intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderPurposeReason(
  purpose?: unknown,
  orderPurpose?: unknown,
  clientPurpose?: unknown,
): string | null {
  if (present(purpose)) {
    return "Order purpose is not supported; the adapter would place a plain spot order";
  }
  if (present(orderPurpose)) {
    return "Order purpose alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientPurpose)) {
    return "Client purpose alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
