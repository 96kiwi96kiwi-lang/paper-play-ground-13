/** Refuse root-order links the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present rootId, orderRoot,
 * or clientRoot is refused: adapters place one plain spot order and do
 * not attach a root, so a tree or multi-leg intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderRootReason(
  rootId: unknown,
  orderRoot?: unknown,
  clientRoot?: unknown,
): string | null {
  if (present(rootId)) {
    return "Root id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderRoot)) {
    return "Order root is not supported; the adapter would place a plain spot order";
  }
  if (present(clientRoot)) {
    return "Client root is not supported; the adapter would place a plain spot order";
  }
  return null;
}
