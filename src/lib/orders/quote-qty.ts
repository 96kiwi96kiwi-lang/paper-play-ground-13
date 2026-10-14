/** Refuse quote-quantity fields the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present quoteQty, quoteOrderQty,
 * or notional is refused: placeLimitOrder / placeMarketOrder take a base
 * amount and do not interpret a quote size, so a quote-quantity intent would
 * otherwise be ignored and the base amount would trade. Zero is present and
 * is refused. This is a quote-quantity floor, not a halt, and does not
 * flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function quoteQtyReason(
  quoteQty: unknown,
  quoteOrderQty?: unknown,
  notional?: unknown,
): string | null {
  if (present(quoteQty)) {
    return "Quote quantity is not supported; the adapter would place a base-amount order";
  }
  if (present(quoteOrderQty)) {
    return "Quote order quantity is not supported; the adapter would place a base-amount order";
  }
  if (present(notional)) {
    return "Notional is not supported; the adapter would place a base-amount order";
  }
  return null;
}
