/** Refuse items aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present items, orderItems, or baseItems
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is an items floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function itemsAliasReason(
  items: unknown,
  orderItems?: unknown,
  baseItems?: unknown,
): string | null {
  if (present(items)) {
    return "Items alias is not supported; the adapter reads amount";
  }
  if (present(orderItems)) {
    return "Order items alias is not supported; the adapter reads amount";
  }
  if (present(baseItems)) {
    return "Base items alias is not supported; the adapter reads amount";
  }
  return null;
}
