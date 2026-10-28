/** Refuse notional aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present notional, orderNotional, or baseNotional is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is a notional floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function notionalAliasReason(
  notional: unknown,
  orderNotional?: unknown,
  baseNotional?: unknown,
): string | null {
  if (present(notional)) {
    return "Notional alias is not supported; the adapter reads amount";
  }
  if (present(orderNotional)) {
    return "Order notional alias is not supported; the adapter reads amount";
  }
  if (present(baseNotional)) {
    return "Base notional alias is not supported; the adapter reads amount";
  }
  return null;
}
