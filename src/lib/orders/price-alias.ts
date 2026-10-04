/** Refuse price aliases the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, and blank pass. A present limitPrice, orderPrice, or px is
 * refused: placeLimitOrder prices by price only, so a price alias would be
 * ignored and the limit would rest or fill at price (or fail as unpriced).
 * Zero is present and is refused. This is a pricing floor, not a halt, and
 * does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function priceAliasReason(
  limitPrice: unknown,
  orderPrice?: unknown,
  px?: unknown,
): string | null {
  if (present(limitPrice)) {
    return "Limit price alias is not supported; the adapter prices by price";
  }
  if (present(orderPrice)) {
    return "Order price is not supported; the adapter prices by price";
  }
  if (present(px)) {
    return "Px is not supported; the adapter prices by price";
  }
  return null;
}
