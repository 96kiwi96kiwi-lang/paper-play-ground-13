/** Refuse cost aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present cost, orderCost, or baseCost is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is a cost floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function costAliasReason(
  cost: unknown,
  orderCost?: unknown,
  baseCost?: unknown,
): string | null {
  if (present(cost)) {
    return "Cost alias is not supported; the adapter reads amount";
  }
  if (present(orderCost)) {
    return "Order cost alias is not supported; the adapter reads amount";
  }
  if (present(baseCost)) {
    return "Base cost alias is not supported; the adapter reads amount";
  }
  return null;
}
