/** Refuse external wish metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present wish, wishId, or
 * orderWish is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a wish or narrative tag. A wish
 * would otherwise be dropped and the order would rest or fill as a plain spot
 * order. Zero is present and is refused. This is a metadata floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderWishReason(
  wish: unknown,
  wishId?: unknown,
  orderWish?: unknown,
): string | null {
  if (present(wish)) {
    return "Wish is not supported; the adapter would place a plain spot order";
  }
  if (present(wishId)) {
    return "Wish id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderWish)) {
    return "Order-wish alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
