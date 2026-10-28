/** Refuse nonce fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present nonce, orderNonce,
 * or clientNonce is refused: adapters place one plain spot order and do
 * not attach a nonce, so a nonce-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderNonceReason(
  nonce: unknown,
  orderNonce?: unknown,
  clientNonce?: unknown,
): string | null {
  if (present(nonce)) {
    return "Nonce is not supported; the adapter would place a plain spot order";
  }
  if (present(orderNonce)) {
    return "Order nonce is not supported; the adapter would place a plain spot order";
  }
  if (present(clientNonce)) {
    return "Client nonce is not supported; the adapter would place a plain spot order";
  }
  return null;
}
