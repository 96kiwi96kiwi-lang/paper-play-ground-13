/** Refuse external order-link ids the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present clOrdId, orderLinkId, or
 * linkId is refused: placeLimitOrder / placeMarketOrder identify by
 * clientOrderId only, and KuCoin createOrder is not given an external link.
 * An alias would be ignored, so a retry would not be idempotent and could
 * double-place. Zero is present and is refused. This is a retry floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderLinkReason(
  clOrdId: unknown,
  orderLinkId?: unknown,
  linkId?: unknown,
): string | null {
  if (present(clOrdId)) {
    return "Client order id is not supported; the adapter identifies by clientOrderId";
  }
  if (present(orderLinkId)) {
    return "Order link id is not supported; the adapter identifies by clientOrderId";
  }
  if (present(linkId)) {
    return "Link id is not supported; the adapter identifies by clientOrderId";
  }
  return null;
}
