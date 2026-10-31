/** Refuse sibling-order links the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present siblingId, orderSibling,
 * or clientSibling is refused: adapters place one plain spot order and do
 * not attach a sibling, so a multi-leg or sibling intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderSiblingReason(
  siblingId: unknown,
  orderSibling?: unknown,
  clientSibling?: unknown,
): string | null {
  if (present(siblingId)) {
    return "Sibling id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderSibling)) {
    return "Order sibling is not supported; the adapter would place a plain spot order";
  }
  if (present(clientSibling)) {
    return "Client sibling is not supported; the adapter would place a plain spot order";
  }
  return null;
}
