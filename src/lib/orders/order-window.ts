/** Refuse order-window text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present window, orderWindow, or
 * clientWindow is refused: placeLimitOrder / placeMarketOrder do not set an
 * order window or client window, so a window intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderWindowReason(
  window?: unknown,
  orderWindow?: unknown,
  clientWindow?: unknown,
): string | null {
  if (present(window)) {
    return "Order window is not supported; the adapter would place a plain spot order";
  }
  if (present(orderWindow)) {
    return "Order window alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientWindow)) {
    return "Client window alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
