/** Refuse order-description fields the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present description, orderDescription, or
 * clientDescription is refused: placeLimitOrder / placeMarketOrder do not set an
 * order description, so a description intent would be ignored and the order would
 * rest or fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderDescriptionReason(
  description?: unknown,
  orderDescription?: unknown,
  clientDescription?: unknown,
): string | null {
  if (present(description)) {
    return "Order description is not supported; the adapter would place a plain spot order";
  }
  if (present(orderDescription)) {
    return "Order description alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientDescription)) {
    return "Client description alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
