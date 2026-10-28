/** Refuse units aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present units, orderUnits, or baseUnits is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is a units floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function unitsAliasReason(
  units: unknown,
  orderUnits?: unknown,
  baseUnits?: unknown,
): string | null {
  if (present(units)) {
    return "Units alias is not supported; the adapter reads amount";
  }
  if (present(orderUnits)) {
    return "Order units alias is not supported; the adapter reads amount";
  }
  if (present(baseUnits)) {
    return "Base units alias is not supported; the adapter reads amount";
  }
  return null;
}
