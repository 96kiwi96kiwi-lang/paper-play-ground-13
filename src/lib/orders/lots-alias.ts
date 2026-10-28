/** Refuse lots aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present lots, orderLots, or baseLots is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is a lots floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function lotsAliasReason(
  lots: unknown,
  orderLots?: unknown,
  baseLots?: unknown,
): string | null {
  if (present(lots)) {
    return "Lots alias is not supported; the adapter reads amount";
  }
  if (present(orderLots)) {
    return "Order lots alias is not supported; the adapter reads amount";
  }
  if (present(baseLots)) {
    return "Base lots alias is not supported; the adapter reads amount";
  }
  return null;
}
