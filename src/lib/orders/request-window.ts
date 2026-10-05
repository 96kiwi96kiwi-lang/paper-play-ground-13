/** Refuse request-window and response-type fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present recvWindow, newOrderRespType,
 * or responseType is refused: adapters place the order without a client deadline
 * or an ACK/FULL result shape, so the intent would be ignored. This is a
 * request floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function requestWindowReason(
  recvWindow: unknown,
  newOrderRespType?: unknown,
  responseType?: unknown,
): string | null {
  if (present(recvWindow)) {
    return "Recv window is not supported; the adapter would place without a client deadline";
  }
  if (present(newOrderRespType)) {
    return "New order response type is not supported; the adapter would ignore ACK or FULL";
  }
  if (present(responseType)) {
    return "Response type is not supported; the adapter would ignore ACK or FULL";
  }
  return null;
}
