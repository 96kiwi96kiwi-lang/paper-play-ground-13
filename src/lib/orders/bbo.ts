/** Refuse best-bid/offer pricing the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present bbo, bestBidOffer, or
 * bookPrice is refused: placeLimitOrder / placeMarketOrder price by price or
 * as a market and do not queue at the best bid or offer, so a book-price
 * intent would be ignored and the order could rest or fill away from the
 * intended queue. Zero is present and is refused. priceMatch and
 * pegOffsetValue remain their own floor. This is a book-price floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function bboReason(
  bbo: unknown,
  bestBidOffer?: unknown,
  bookPrice?: unknown,
): string | null {
  if (present(bbo)) {
    return "BBO is not supported; the adapter would place a normal spot order";
  }
  if (present(bestBidOffer)) {
    return "Best bid offer is not supported; the adapter would place a normal spot order";
  }
  if (present(bookPrice)) {
    return "Book price is not supported; the adapter would place a normal spot order";
  }
  return null;
}
