/** Refuse pair aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present pair, market, or instrument
 * is refused: adapters place by symbol only. An alias would be ignored and the
 * order would use the canonical symbol or fail. Zero is present and is refused.
 * This is a pair floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function pairAliasReason(
  pair: unknown,
  market?: unknown,
  instrument?: unknown,
): string | null {
  if (present(pair)) {
    return "Pair alias is not supported; the adapter reads symbol";
  }
  if (present(market)) {
    return "Market alias is not supported; the adapter reads symbol";
  }
  if (present(instrument)) {
    return "Instrument alias is not supported; the adapter reads symbol";
  }
  return null;
}
