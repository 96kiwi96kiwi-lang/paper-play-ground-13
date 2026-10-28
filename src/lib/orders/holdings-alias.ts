/** Refuse holdings aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present holdings, orderHoldings, or baseHoldings
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is a holdings floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function holdingsAliasReason(
  holdings: unknown,
  orderHoldings?: unknown,
  baseHoldings?: unknown,
): string | null {
  if (present(holdings)) {
    return "Holdings alias is not supported; the adapter reads amount";
  }
  if (present(orderHoldings)) {
    return "Order holdings alias is not supported; the adapter reads amount";
  }
  if (present(baseHoldings)) {
    return "Base holdings alias is not supported; the adapter reads amount";
  }
  return null;
}
