/** Refuse order-tag fields the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present tag, orderTag, or clientTag
 * is refused: placeLimitOrder / placeMarketOrder do not set an order tag, so a
 * tag intent would be ignored and the order would rest or fill as a plain spot
 * order. Zero is present and is refused. This is a metadata floor, not a halt,
 * and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderTagReason(
  tag: unknown,
  orderTag?: unknown,
  clientTag?: unknown,
): string | null {
  if (present(tag)) {
    return "Order tag is not supported; the adapter would place a plain spot order";
  }
  if (present(orderTag)) {
    return "Order tag alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientTag)) {
    return "Client tag is not supported; the adapter would place a plain spot order";
  }
  return null;
}
