/** Refuse name fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present name, orderName,
 * or clientName is refused: adapters place one plain spot order and do
 * not attach a name, so a name-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderNameReason(
  name: unknown,
  orderName?: unknown,
  clientName?: unknown,
): string | null {
  if (present(name)) {
    return "Name is not supported; the adapter would place a plain spot order";
  }
  if (present(orderName)) {
    return "Order name is not supported; the adapter would place a plain spot order";
  }
  if (present(clientName)) {
    return "Client name is not supported; the adapter would place a plain spot order";
  }
  return null;
}
