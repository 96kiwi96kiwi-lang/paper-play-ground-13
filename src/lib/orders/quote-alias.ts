/** Refuse quote aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present quote, orderQuote, or baseQuote
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is a quote floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function quoteAliasReason(
  quote: unknown,
  orderQuote?: unknown,
  baseQuote?: unknown,
): string | null {
  if (present(quote)) {
    return "Quote alias is not supported; the adapter reads amount";
  }
  if (present(orderQuote)) {
    return "Order quote alias is not supported; the adapter reads amount";
  }
  if (present(baseQuote)) {
    return "Base quote alias is not supported; the adapter reads amount";
  }
  return null;
}
