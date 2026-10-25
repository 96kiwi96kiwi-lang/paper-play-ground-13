/** Refuse hash fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present hash, orderHash,
 * or clientHash is refused: adapters place one plain spot order and do
 * not attach a hash, so a hash-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderHashReason(
  hash: unknown,
  orderHash?: unknown,
  clientHash?: unknown,
): string | null {
  if (present(hash)) {
    return "Hash is not supported; the adapter would place a plain spot order";
  }
  if (present(orderHash)) {
    return "Order hash is not supported; the adapter would place a plain spot order";
  }
  if (present(clientHash)) {
    return "Client hash is not supported; the adapter would place a plain spot order";
  }
  return null;
}
