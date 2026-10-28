/** Refuse order-synopsis fields the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present synopsis, orderSynopsis, or
 * clientSynopsis is refused: placeLimitOrder / placeMarketOrder do not set an
 * order synopsis, so a synopsis intent would be ignored and the order would
 * rest or fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderSynopsisReason(
  synopsis?: unknown,
  orderSynopsis?: unknown,
  clientSynopsis?: unknown,
): string | null {
  if (present(synopsis)) {
    return "Order synopsis is not supported; the adapter would place a plain spot order";
  }
  if (present(orderSynopsis)) {
    return "Order synopsis alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientSynopsis)) {
    return "Client synopsis alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
