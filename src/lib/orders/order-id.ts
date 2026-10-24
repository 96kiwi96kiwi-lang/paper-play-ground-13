/** Refuse id fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present id, orderId,
 * or clientId is refused: adapters place one plain spot order and do
 * not attach an id, so an id-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderIdReason(
  id: unknown,
  orderId?: unknown,
  clientId?: unknown,
): string | null {
  if (present(id)) {
    return "Id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderId)) {
    return "Order id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientId)) {
    return "Client id is not supported; the adapter would place a plain spot order";
  }
  return null;
}
