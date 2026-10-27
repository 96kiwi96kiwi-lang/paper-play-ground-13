/** Refuse order-outline fields the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present outline, orderOutline, or
 * clientOutline is refused: placeLimitOrder / placeMarketOrder do not set an
 * order outline, so an outline intent would be ignored and the order would
 * rest or fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderOutlineReason(
  outline?: unknown,
  orderOutline?: unknown,
  clientOutline?: unknown,
): string | null {
  if (present(outline)) {
    return "Order outline is not supported; the adapter would place a plain spot order";
  }
  if (present(orderOutline)) {
    return "Order outline alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientOutline)) {
    return "Client outline alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
