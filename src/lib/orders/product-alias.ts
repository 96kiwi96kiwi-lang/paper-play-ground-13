/** Refuse product aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present product, instId, or ticker is
 * refused: adapters place by symbol only. An alias would be ignored and the
 * order would use the canonical symbol or fail. Zero is present and is refused.
 * This is a product floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function productAliasReason(
  product: unknown,
  instId?: unknown,
  ticker?: unknown,
): string | null {
  if (present(product)) {
    return "Product alias is not supported; the adapter reads symbol";
  }
  if (present(instId)) {
    return "Inst id alias is not supported; the adapter reads symbol";
  }
  if (present(ticker)) {
    return "Ticker alias is not supported; the adapter reads symbol";
  }
  return null;
}
