/** Refuse value aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present value, orderValue, or baseValue is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is a value floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function valueAliasReason(
  value: unknown,
  orderValue?: unknown,
  baseValue?: unknown,
): string | null {
  if (present(value)) {
    return "Value alias is not supported; the adapter reads amount";
  }
  if (present(orderValue)) {
    return "Order value alias is not supported; the adapter reads amount";
  }
  if (present(baseValue)) {
    return "Base value alias is not supported; the adapter reads amount";
  }
  return null;
}
