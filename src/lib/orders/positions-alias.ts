/** Refuse positions aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present positions, orderPositions, or basePositions
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is a positions floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function positionsAliasReason(
  positions: unknown,
  orderPositions?: unknown,
  basePositions?: unknown,
): string | null {
  if (present(positions)) {
    return "Positions alias is not supported; the adapter reads amount";
  }
  if (present(orderPositions)) {
    return "Order positions alias is not supported; the adapter reads amount";
  }
  if (present(basePositions)) {
    return "Base positions alias is not supported; the adapter reads amount";
  }
  return null;
}
