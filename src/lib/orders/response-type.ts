/** Refuse response-type aliases the spot adapters do not request. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present newOrderRespType, orderRespType,
 * or respType is refused: placeLimitOrder / placeMarketOrder return one unified
 * order and do not request ACK, RESULT, or FULL, so a fill-detail expectation
 * would be ignored and an ack could be treated as a complete fill. Zero and
 * "FULL" are present and are refused. clientOrderId and validateOnly remain
 * their own floors. This is a response-type floor, not a halt, and does not
 * flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function responseTypeReason(
  newOrderRespType: unknown,
  orderRespType?: unknown,
  respType?: unknown,
): string | null {
  if (present(newOrderRespType)) {
    return "Order response type is not supported; the adapter would return a unified order";
  }
  if (present(orderRespType)) {
    return "Response type is not supported; the adapter would return a unified order";
  }
  if (present(respType)) {
    return "Resp type is not supported; the adapter would return a unified order";
  }
  return null;
}
