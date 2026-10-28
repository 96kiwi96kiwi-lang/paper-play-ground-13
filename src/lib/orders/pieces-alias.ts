/** Refuse pieces aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present pieces, orderPieces, or basePieces
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is a pieces floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function piecesAliasReason(
  pieces: unknown,
  orderPieces?: unknown,
  basePieces?: unknown,
): string | null {
  if (present(pieces)) {
    return "Pieces alias is not supported; the adapter reads amount";
  }
  if (present(orderPieces)) {
    return "Order pieces alias is not supported; the adapter reads amount";
  }
  if (present(basePieces)) {
    return "Base pieces alias is not supported; the adapter reads amount";
  }
  return null;
}
