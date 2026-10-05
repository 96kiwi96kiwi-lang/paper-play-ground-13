/** Refuse book-relative price fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present priceMatch, pegPriceType,
 * or pegOffsetValue is refused: adapters place at price or as a market and
 * do not peg to the book, so a match or peg intent would be ignored and the
 * order could rest or fill away from the intended queue. This is a price-match
 * floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function priceMatchReason(
  priceMatch: unknown,
  pegPriceType?: unknown,
  pegOffsetValue?: unknown,
): string | null {
  if (present(priceMatch)) {
    return "Price match is not supported; the adapter would place without a book-relative price";
  }
  if (present(pegPriceType)) {
    return "Peg price type is not supported; the adapter would place without a book-relative price";
  }
  if (present(pegOffsetValue)) {
    return "Peg offset is not supported; the adapter would place without a book-relative price";
  }
  return null;
}
