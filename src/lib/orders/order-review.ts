/** Refuse order-review fields the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present review, orderReview, or
 * clientReview is refused: placeLimitOrder / placeMarketOrder do not set an
 * order review, so a review intent would be ignored and the order would
 * rest or fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderReviewReason(
  review?: unknown,
  orderReview?: unknown,
  clientReview?: unknown,
): string | null {
  if (present(review)) {
    return "Order review is not supported; the adapter would place a plain spot order";
  }
  if (present(orderReview)) {
    return "Order review alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientReview)) {
    return "Client review alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
