/** Refuse amount aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present amt, orderAmt, or baseAmt is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is an amount floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function amountAliasReason(
  amt: unknown,
  orderAmt?: unknown,
  baseAmt?: unknown,
): string | null {
  if (present(amt)) {
    return "Amt alias is not supported; the adapter reads amount";
  }
  if (present(orderAmt)) {
    return "Order amt alias is not supported; the adapter reads amount";
  }
  if (present(baseAmt)) {
    return "Base amt alias is not supported; the adapter reads amount";
  }
  return null;
}
