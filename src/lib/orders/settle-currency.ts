/** Refuse a settlement currency the spot adapters do not apply. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present settleCcy, settleCoin, or
 * quoteCoin is refused: placeLimitOrder / placeMarketOrder trade the spot pair
 * and do not set a settlement asset. A settle currency would be ignored and the
 * base amount would still trade on the spot book. Zero is present and is refused.
 * This is a settlement floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function settleCurrencyReason(
  settleCcy: unknown,
  settleCoin?: unknown,
  quoteCoin?: unknown,
): string | null {
  if (present(settleCcy)) {
    return "Settle currency is not supported; the adapter places the base size on the spot book";
  }
  if (present(settleCoin)) {
    return "Settle coin is not supported; the adapter places the base size on the spot book";
  }
  if (present(quoteCoin)) {
    return "Quote coin is not supported; the adapter places the base size on the spot book";
  }
  return null;
}
