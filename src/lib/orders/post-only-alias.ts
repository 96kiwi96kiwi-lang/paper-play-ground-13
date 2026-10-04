/** Refuse post-only aliases the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, blank, and false pass. A present post_only, makerOnly, or
 * timeInForcePostOnly is refused: placeLimitOrder does not send a maker-only
 * flag, and the post-only floor reads postOnly only. An alias would be
 * ignored and the order would rest or take as a normal order. This is a
 * maker floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (value === false) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function postOnlyAliasReason(
  postOnlyAlias: unknown,
  makerOnly?: unknown,
  timeInForcePostOnly?: unknown,
): string | null {
  if (present(postOnlyAlias)) {
    return "Post only alias is not supported; the adapter reads postOnly";
  }
  if (present(makerOnly)) {
    return "Maker only is not supported; the adapter reads postOnly";
  }
  if (present(timeInForcePostOnly)) {
    return "Time in force post only is not supported; the adapter reads postOnly";
  }
  return null;
}
