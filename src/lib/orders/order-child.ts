/** Refuse child-order links the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present childId, orderChild,
 * or clientChild is refused: adapters place one plain spot order and do
 * not attach a child, so a parent-child or bracket intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderChildReason(
  childId: unknown,
  orderChild?: unknown,
  clientChild?: unknown,
): string | null {
  if (present(childId)) {
    return "Child id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderChild)) {
    return "Order child is not supported; the adapter would place a plain spot order";
  }
  if (present(clientChild)) {
    return "Client child is not supported; the adapter would place a plain spot order";
  }
  return null;
}
