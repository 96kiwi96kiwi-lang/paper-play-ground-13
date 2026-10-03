/** Refuse a quote-sized field the adapters do not forward. Not a halt. */

/**
 * Omitted, null, and blank pass. Any present quote size is refused:
 * placeLimitOrder / placeMarketOrder send the base amount only, so funds,
 * quoteOrderQty, or quoteQty would be ignored and the base size would trade.
 * This is a sizing floor, not a halt, and does not flatten positions.
 */
export function quoteSizeReason(value: unknown, label: string): string | null {
  if (value == null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return `${label} is not supported; the adapter sizes by base amount only`;
}
