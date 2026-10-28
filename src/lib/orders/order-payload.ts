/** Refuse order-payload text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present payload, orderPayload, or
 * clientPayload is refused: placeLimitOrder / placeMarketOrder do not set an
 * order payload or client payload, so a payload intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderPayloadReason(
  payload?: unknown,
  orderPayload?: unknown,
  clientPayload?: unknown,
): string | null {
  if (present(payload)) {
    return "Order payload is not supported; the adapter would place a plain spot order";
  }
  if (present(orderPayload)) {
    return "Order payload alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientPayload)) {
    return "Client payload alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
