/** Refuse order-source flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present source, orderSource, or
 * src is refused: placeLimitOrder / placeMarketOrder do not set an order
 * source or partner tag, so a source intent would be ignored and the order
 * would rest or fill as a plain spot order. Zero is present and is refused.
 * This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderSourceReason(
  source?: unknown,
  orderSource?: unknown,
  src?: unknown,
): string | null {
  if (present(source)) {
    return "Order source is not supported; the adapter would place a plain spot order";
  }
  if (present(orderSource)) {
    return "Order source alias is not supported; the adapter would place a plain spot order";
  }
  if (present(src)) {
    return "Source alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
