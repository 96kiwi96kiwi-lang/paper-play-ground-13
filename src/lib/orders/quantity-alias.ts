/** Refuse quantity aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present quantity, orderQuantity, or baseQuantity is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is a quantity floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function quantityAliasReason(
  quantity: unknown,
  orderQuantity?: unknown,
  baseQuantity?: unknown,
): string | null {
  if (present(quantity)) {
    return "Quantity alias is not supported; the adapter reads amount";
  }
  if (present(orderQuantity)) {
    return "Order quantity alias is not supported; the adapter reads amount";
  }
  if (present(baseQuantity)) {
    return "Base quantity alias is not supported; the adapter reads amount";
  }
  return null;
}
