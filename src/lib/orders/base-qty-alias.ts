/** Refuse base-qty aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present baseQty, orderBaseQty, or baseBaseQty is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is a base-qty floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function baseQtyAliasReason(
  baseQty: unknown,
  orderBaseQty?: unknown,
  baseBaseQty?: unknown,
): string | null {
  if (present(baseQty)) {
    return "Base qty alias is not supported; the adapter reads amount";
  }
  if (present(orderBaseQty)) {
    return "Order base qty alias is not supported; the adapter reads amount";
  }
  if (present(baseBaseQty)) {
    return "Base base qty alias is not supported; the adapter reads amount";
  }
  return null;
}
