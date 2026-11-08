/** Refuse linked-order flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present linkId, orderLink, or
 * clientLink is refused: placeLimitOrder / placeMarketOrder do not attach a
 * link, so a linked-order intent would be ignored and the order would rest or
 * fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderLinkReason(
  linkId?: unknown,
  orderLink?: unknown,
  clientLink?: unknown,
): string | null {
  if (present(linkId)) {
    return "Link id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderLink)) {
    return "Order link is not supported; the adapter would place a plain spot order";
  }
  if (present(clientLink)) {
    return "Client link alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
