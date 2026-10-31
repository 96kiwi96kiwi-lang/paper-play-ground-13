/** Refuse key fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present key, orderKey,
 * or clientKey is refused: adapters place one plain spot order and do
 * not attach a key, so a key-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderKeyReason(
  key: unknown,
  orderKey?: unknown,
  clientKey?: unknown,
): string | null {
  if (present(key)) {
    return "Key is not supported; the adapter would place a plain spot order";
  }
  if (present(orderKey)) {
    return "Order key is not supported; the adapter would place a plain spot order";
  }
  if (present(clientKey)) {
    return "Client key is not supported; the adapter would place a plain spot order";
  }
  return null;
}
