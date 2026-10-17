/** Refuse count aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present count, orderCount, or baseCount is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is a count floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function countAliasReason(
  count: unknown,
  orderCount?: unknown,
  baseCount?: unknown,
): string | null {
  if (present(count)) {
    return "Count alias is not supported; the adapter reads amount";
  }
  if (present(orderCount)) {
    return "Order count alias is not supported; the adapter reads amount";
  }
  if (present(baseCount)) {
    return "Base count alias is not supported; the adapter reads amount";
  }
  return null;
}
