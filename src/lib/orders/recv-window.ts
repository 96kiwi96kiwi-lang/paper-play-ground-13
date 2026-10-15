/** Refuse recv-window fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present recvWindow is refused:
 * placeLimitOrder / placeMarketOrder place the order without a client
 * deadline, so a recvWindow intent would otherwise be ignored and the base
 * size would rest or fill immediately. Zero and "0" are present and are
 * refused. This is a recv-window floor, not a halt, and does not flatten
 * positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function recvWindowReason(recvWindow: unknown): string | null {
  if (present(recvWindow)) {
    return "Recv window is not supported; the adapter would place without a client deadline";
  }
  return null;
}
