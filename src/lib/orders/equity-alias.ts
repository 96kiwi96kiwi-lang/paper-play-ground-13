/** Refuse equity aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present equity, orderEquity, or baseEquity
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is an equity floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function equityAliasReason(
  equity: unknown,
  orderEquity?: unknown,
  baseEquity?: unknown,
): string | null {
  if (present(equity)) {
    return "Equity alias is not supported; the adapter reads amount";
  }
  if (present(orderEquity)) {
    return "Order equity alias is not supported; the adapter reads amount";
  }
  if (present(baseEquity)) {
    return "Base equity alias is not supported; the adapter reads amount";
  }
  return null;
}
