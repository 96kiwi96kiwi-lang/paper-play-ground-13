/** Refuse parent-order links the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present parentId, orderParent,
 * or clientParent is refused: adapters place one plain spot order and do
 * not attach a parent, so a parent-child intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderParentReason(
  parentId: unknown,
  orderParent?: unknown,
  clientParent?: unknown,
): string | null {
  if (present(parentId)) {
    return "Parent id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderParent)) {
    return "Order parent is not supported; the adapter would place a plain spot order";
  }
  if (present(clientParent)) {
    return "Client parent is not supported; the adapter would place a plain spot order";
  }
  return null;
}
