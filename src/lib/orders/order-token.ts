/** Refuse token fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present token, orderToken,
 * or clientToken is refused: adapters place one plain spot order and do
 * not attach a token, so a token-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderTokenReason(
  token: unknown,
  orderToken?: unknown,
  clientToken?: unknown,
): string | null {
  if (present(token)) {
    return "Token is not supported; the adapter would place a plain spot order";
  }
  if (present(orderToken)) {
    return "Order token is not supported; the adapter would place a plain spot order";
  }
  if (present(clientToken)) {
    return "Client token is not supported; the adapter would place a plain spot order";
  }
  return null;
}
