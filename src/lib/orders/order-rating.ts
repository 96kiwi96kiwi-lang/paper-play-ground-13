/** Refuse rating fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present rating, orderRating,
 * or clientRating is refused: adapters place one plain spot order and do
 * not attach a rating, so a rating-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderRatingReason(
  rating: unknown,
  orderRating?: unknown,
  clientRating?: unknown,
): string | null {
  if (present(rating)) {
    return "Rating is not supported; the adapter would place a plain spot order";
  }
  if (present(orderRating)) {
    return "Order rating is not supported; the adapter would place a plain spot order";
  }
  if (present(clientRating)) {
    return "Client rating is not supported; the adapter would place a plain spot order";
  }
  return null;
}
