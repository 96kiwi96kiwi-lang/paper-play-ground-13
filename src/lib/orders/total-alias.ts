/** Refuse total aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present total, orderTotal, or baseTotal is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is a total floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function totalAliasReason(
  total: unknown,
  orderTotal?: unknown,
  baseTotal?: unknown,
): string | null {
  if (present(total)) {
    return "Total alias is not supported; the adapter reads amount";
  }
  if (present(orderTotal)) {
    return "Order total alias is not supported; the adapter reads amount";
  }
  if (present(baseTotal)) {
    return "Base total alias is not supported; the adapter reads amount";
  }
  return null;
}
