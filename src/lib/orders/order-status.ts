/** Refuse status fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present status, orderStatus,
 * or clientStatus is refused: adapters place one plain spot order and do
 * not attach a status, so a status-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderStatusReason(
  status: unknown,
  orderStatus?: unknown,
  clientStatus?: unknown,
): string | null {
  if (present(status)) {
    return "Status is not supported; the adapter would place a plain spot order";
  }
  if (present(orderStatus)) {
    return "Order status is not supported; the adapter would place a plain spot order";
  }
  if (present(clientStatus)) {
    return "Client status is not supported; the adapter would place a plain spot order";
  }
  return null;
}
