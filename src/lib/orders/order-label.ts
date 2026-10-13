/** Refuse order-label flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present label, orderLabel, or
 * clientLabel is refused: placeLimitOrder / placeMarketOrder do not set an
 * order label or client label, so a label intent would be ignored and the
 * order would rest or fill as a plain spot order. Zero is present and is
 * refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderLabelReason(
  label?: unknown,
  orderLabel?: unknown,
  clientLabel?: unknown,
): string | null {
  if (present(label)) {
    return "Order label is not supported; the adapter would place a plain spot order";
  }
  if (present(orderLabel)) {
    return "Order label alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientLabel)) {
    return "Client label alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
