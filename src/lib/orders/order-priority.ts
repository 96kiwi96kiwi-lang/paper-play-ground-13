/** Refuse order-priority text the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present priority, orderPriority, or
 * clientPriority is refused: placeLimitOrder / placeMarketOrder do not set an
 * order priority or client priority, so a priority intent would be ignored
 * and the order would rest or fill as a plain spot order. Zero is present and
 * is refused. This is a metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderPriorityReason(
  priority?: unknown,
  orderPriority?: unknown,
  clientPriority?: unknown,
): string | null {
  if (present(priority)) {
    return "Order priority is not supported; the adapter would place a plain spot order";
  }
  if (present(orderPriority)) {
    return "Order priority alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientPriority)) {
    return "Client priority alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
