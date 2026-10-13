/** Refuse an open/close offset the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present openClose, posOffset, or
 * closeFraction is refused: placeLimitOrder / placeMarketOrder do not send an
 * open or close offset, so a close intent would be ignored and the base amount
 * would still trade on the spot book. Zero is present and is refused.
 * closePosition remains its own floor. This is an open/close offset floor, not
 * a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function openOffsetReason(
  openClose: unknown,
  posOffset?: unknown,
  closeFraction?: unknown,
): string | null {
  if (present(openClose)) {
    return "Open/close offset is not supported; the adapter would place a spot order";
  }
  if (present(posOffset)) {
    return "Position offset is not supported; the adapter would place a spot order";
  }
  if (present(closeFraction)) {
    return "Close fraction is not supported; the adapter would place a spot order";
  }
  return null;
}
