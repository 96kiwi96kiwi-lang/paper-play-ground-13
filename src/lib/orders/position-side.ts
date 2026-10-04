/** Refuse futures position side the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, and blank pass. A present position side, hedge mode, or
 * position mode is refused: placeLimitOrder / placeMarketOrder do not send
 * those fields, so a long, short, or hedge intent would trade on the spot book
 * at the base size. LONG, SHORT, BOTH, and hedge are present and are refused.
 * This is a product floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function positionSideReason(
  positionSide: unknown,
  hedgeMode?: unknown,
  positionMode?: unknown,
): string | null {
  if (present(positionSide)) {
    return "Position side is not supported; the adapter would place a spot order";
  }
  if (present(hedgeMode)) {
    return "Hedge mode is not supported; the adapter would place a spot order";
  }
  if (present(positionMode)) {
    return "Position mode is not supported; the adapter would place a spot order";
  }
  return null;
}
