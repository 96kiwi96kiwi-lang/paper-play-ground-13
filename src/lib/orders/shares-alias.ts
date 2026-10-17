/** Refuse shares aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present shares, orderShares, or baseShares is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is a shares floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function sharesAliasReason(
  shares: unknown,
  orderShares?: unknown,
  baseShares?: unknown,
): string | null {
  if (present(shares)) {
    return "Shares alias is not supported; the adapter reads amount";
  }
  if (present(orderShares)) {
    return "Order shares alias is not supported; the adapter reads amount";
  }
  if (present(baseShares)) {
    return "Base shares alias is not supported; the adapter reads amount";
  }
  return null;
}
