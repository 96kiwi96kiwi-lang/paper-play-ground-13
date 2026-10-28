/** Refuse position index fields the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present positionIdx, posIdx, or
 * hedgeIdx is refused: adapters place one plain spot order and do not send a
 * position index, so a one-way or hedge index intent would otherwise be ignored
 * and the base size would trade on the spot book. Zero is present and is refused.
 * This is a position floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function positionIdxReason(
  positionIdx: unknown,
  posIdx?: unknown,
  hedgeIdx?: unknown,
): string | null {
  if (present(positionIdx)) {
    return "Position index is not supported; the adapter places one spot order";
  }
  if (present(posIdx)) {
    return "Pos index is not supported; the adapter places one spot order";
  }
  if (present(hedgeIdx)) {
    return "Hedge index is not supported; the adapter places one spot order";
  }
  return null;
}
