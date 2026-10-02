/** Refuse a market submit that cannot be sized. Not a halt. */

/**
 * Price used for notional floors. A positive limit/market `price` wins.
 * A market with only `markPrice` still gets a reference so min/max notional
 * can run. A limit never borrows the mark here (the limit-price path owns that).
 */
export function marketReferencePrice(
  type: "market" | "limit",
  price: number | undefined,
  markPrice: number | undefined,
): number | undefined {
  if (price && price > 0) return price;
  if (type === "market" && markPrice && markPrice > 0) return markPrice;
  return undefined;
}

/**
 * A market submit is refused when neither `price` nor `markPrice` is positive.
 * Limits are not this floor — a missing limit price is refused later.
 * Disabled by passing a positive reference through either field.
 */
export function unpricedMarketReason(
  type: "market" | "limit",
  price: number | undefined,
  markPrice: number | undefined,
): string | null {
  if (type !== "market") return null;
  if (marketReferencePrice(type, price, markPrice) != null) return null;
  return "Unpriced market: submit needs a positive price or markPrice so notional floors can run";
}
