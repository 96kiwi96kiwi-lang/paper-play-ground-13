/** Refuse sz aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present sz, orderSz, or szValue is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is an sz floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function szAliasReason(
  sz: unknown,
  orderSz?: unknown,
  szValue?: unknown,
): string | null {
  if (present(sz)) {
    return "Sz alias is not supported; the adapter reads amount";
  }
  if (present(orderSz)) {
    return "Order sz alias is not supported; the adapter reads amount";
  }
  if (present(szValue)) {
    return "Sz value alias is not supported; the adapter reads amount";
  }
  return null;
}
