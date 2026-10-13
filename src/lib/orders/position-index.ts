/** Refuse a hedge position index the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present positionIdx, posSide, or
 * positionIndex is refused: placeLimitOrder / placeMarketOrder do not send a
 * hedge slot, so a long or short index would be ignored and the base amount
 * would still trade on the spot book. Zero is present and is refused.
 * positionSide remains its own floor. This is a hedge-index floor, not a halt,
 * and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function positionIndexReason(
  positionIdx: unknown,
  posSide?: unknown,
  positionIndex?: unknown,
): string | null {
  if (present(positionIdx)) {
    return "Position index is not supported; the adapter would place a spot order";
  }
  if (present(posSide)) {
    return "Position side alias is not supported; the adapter would place a spot order";
  }
  if (present(positionIndex)) {
    return "Position index alias is not supported; the adapter would place a spot order";
  }
  return null;
}
