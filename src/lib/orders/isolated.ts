/** Refuse isolated-margin and close-position flags the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present isolated flag or close-position
 * flag is refused: placeLimitOrder / placeMarketOrder do not send those fields,
 * so an isolated-margin or close-entire-position intent would trade on the spot
 * book at the base size. Zero is present and is refused. This is a margin floor,
 * not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function isolatedReason(
  isolated: unknown,
  isIsolated?: unknown,
  closePosition?: unknown,
): string | null {
  if (present(isolated)) {
    return "Isolated margin is not supported; the adapter would place a spot order";
  }
  if (present(isIsolated)) {
    return "Isolated flag is not supported; the adapter would place a spot order";
  }
  if (present(closePosition)) {
    return "Close position is not supported; the adapter would place a spot order";
  }
  return null;
}
