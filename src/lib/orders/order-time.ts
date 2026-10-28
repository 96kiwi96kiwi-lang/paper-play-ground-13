/** Refuse timestamp fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present timestamp, orderTimestamp,
 * or clientTimestamp is refused: adapters place one plain spot order and do
 * not attach a timestamp, so a time-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderTimeReason(
  timestamp: unknown,
  orderTimestamp?: unknown,
  clientTimestamp?: unknown,
): string | null {
  if (present(timestamp)) {
    return "Timestamp is not supported; the adapter would place a plain spot order";
  }
  if (present(orderTimestamp)) {
    return "Order timestamp is not supported; the adapter would place a plain spot order";
  }
  if (present(clientTimestamp)) {
    return "Client timestamp is not supported; the adapter would place a plain spot order";
  }
  return null;
}
