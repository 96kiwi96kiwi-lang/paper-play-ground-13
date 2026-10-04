/** Refuse client-order-id aliases the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, and blank pass. A present clientOid, newClientOrderId, or
 * origClientOrderId is refused: placeLimitOrder / placeMarketOrder identify
 * by clientOrderId only, and KuCoin createOrder is not given clientOid. An
 * alias would be ignored, so a retry would not be idempotent and could
 * double-place. This is a retry floor, not a halt, and does not flatten
 * positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function clientIdAliasReason(
  clientOid: unknown,
  newClientOrderId?: unknown,
  origClientOrderId?: unknown,
): string | null {
  if (present(clientOid)) {
    return "Client oid is not supported; the adapter identifies by clientOrderId";
  }
  if (present(newClientOrderId)) {
    return "New client order id is not supported; the adapter identifies by clientOrderId";
  }
  if (present(origClientOrderId)) {
    return "Orig client order id is not supported; the adapter identifies by clientOrderId";
  }
  return null;
}
