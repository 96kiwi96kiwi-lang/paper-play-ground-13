/** Refuse priority fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present priority, orderPriority,
 * or clientPriority is refused: adapters place one plain spot order and do
 * not attach a priority, so a priority-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderPriorityReason(
  priority: unknown,
  orderPriority?: unknown,
  clientPriority?: unknown,
): string | null {
  if (present(priority)) {
    return "Priority is not supported; the adapter would place a plain spot order";
  }
  if (present(orderPriority)) {
    return "Order priority is not supported; the adapter would place a plain spot order";
  }
  if (present(clientPriority)) {
    return "Client priority is not supported; the adapter would place a plain spot order";
  }
  return null;
}
