/** Refuse sum aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present sum, orderSum, or baseSum is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is a sum floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function sumAliasReason(
  sum: unknown,
  orderSum?: unknown,
  baseSum?: unknown,
): string | null {
  if (present(sum)) {
    return "Sum alias is not supported; the adapter reads amount";
  }
  if (present(orderSum)) {
    return "Order sum alias is not supported; the adapter reads amount";
  }
  if (present(baseSum)) {
    return "Base sum alias is not supported; the adapter reads amount";
  }
  return null;
}
