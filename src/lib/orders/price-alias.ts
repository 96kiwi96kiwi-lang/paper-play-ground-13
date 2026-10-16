/** Refuse price aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present px, limitPx, or orderPrice
 * is refused: adapters place a limit by price only. An alias would be
 * ignored and the limit would use the canonical price or fail.
 * Zero is present and is refused. This is a price floor, not a halt,
 * and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function priceAliasReason(
  px: unknown,
  limitPx?: unknown,
  orderPrice?: unknown,
): string | null {
  if (present(px)) {
    return "Price alias is not supported; the adapter reads price";
  }
  if (present(limitPx)) {
    return "Limit price alias is not supported; the adapter reads price";
  }
  if (present(orderPrice)) {
    return "Order price alias is not supported; the adapter reads price";
  }
  return null;
}
