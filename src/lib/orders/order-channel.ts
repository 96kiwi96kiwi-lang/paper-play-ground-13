/** Refuse order-channel flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present channel, orderChannel, or
 * origin is refused: placeLimitOrder / placeMarketOrder do not set an order
 * channel or origin tag, so a channel intent would be ignored and the order
 * would rest or fill as a plain spot order. Zero is present and is refused.
 * This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderChannelReason(
  channel?: unknown,
  orderChannel?: unknown,
  origin?: unknown,
): string | null {
  if (present(channel)) {
    return "Order channel is not supported; the adapter would place a plain spot order";
  }
  if (present(orderChannel)) {
    return "Order channel alias is not supported; the adapter would place a plain spot order";
  }
  if (present(origin)) {
    return "Origin alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
