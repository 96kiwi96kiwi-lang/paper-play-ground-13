/** Refuse a futures trade side the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present tradeSide, holdSide, or
 * openType is refused: placeLimitOrder / placeMarketOrder do not send a futures
 * trade side, so an open-long or close-short intent would be ignored and the
 * base amount would still trade on the spot book. Zero is present and is
 * refused. openClose remains its own floor. This is a trade-side floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function tradeSideReason(
  tradeSide: unknown,
  holdSide?: unknown,
  openType?: unknown,
): string | null {
  if (present(tradeSide)) {
    return "Trade side is not supported; the adapter would place a spot order";
  }
  if (present(holdSide)) {
    return "Hold side is not supported; the adapter would place a spot order";
  }
  if (present(openType)) {
    return "Open type is not supported; the adapter would place a spot order";
  }
  return null;
}
