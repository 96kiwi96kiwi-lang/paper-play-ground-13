/** Refuse order-visibility text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present visibility, orderVisibility, or
 * clientVisibility is refused: placeLimitOrder / placeMarketOrder do not set an
 * order visibility or client visibility, so a visibility intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderVisibilityReason(
  visibility?: unknown,
  orderVisibility?: unknown,
  clientVisibility?: unknown,
): string | null {
  if (present(visibility)) {
    return "Order visibility is not supported; the adapter would place a plain spot order";
  }
  if (present(orderVisibility)) {
    return "Order visibility alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientVisibility)) {
    return "Client visibility alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
