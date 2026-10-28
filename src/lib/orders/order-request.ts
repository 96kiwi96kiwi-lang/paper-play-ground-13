/** Refuse request-id fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present requestId, orderRequestId,
 * or clientRequestId is refused: adapters place one plain spot order and do
 * not attach a request id, so a request-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderRequestReason(
  requestId: unknown,
  orderRequestId?: unknown,
  clientRequestId?: unknown,
): string | null {
  if (present(requestId)) {
    return "Request id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderRequestId)) {
    return "Order request id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientRequestId)) {
    return "Client request id is not supported; the adapter would place a plain spot order";
  }
  return null;
}
