/** Refuse order-type aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present ordType, orderType, or order_type
 * is refused: adapters place by type only. An omitted type defaults to market,
 * so an alias would be ignored and a limit intent could trade as a market.
 * This is a type floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderTypeAliasReason(
  ordType: unknown,
  orderType?: unknown,
  order_type?: unknown,
): string | null {
  if (present(ordType)) {
    return "Ord type is not supported; the adapter reads type";
  }
  if (present(orderType)) {
    return "Order type alias is not supported; the adapter reads type";
  }
  if (present(order_type)) {
    return "Order type snake alias is not supported; the adapter reads type";
  }
  return null;
}
