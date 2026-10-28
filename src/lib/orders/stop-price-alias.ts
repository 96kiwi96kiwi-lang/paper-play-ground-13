/** Refuse stop-price aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present stopPrice, triggerPrice, or stopPx is
 * refused: adapters place by price or market only and do not read a stop price.
 * An alias intent would otherwise be ignored and the order would place as a
 * plain market or limit. This is a stop floor, not a halt, and does not flatten
 * positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function stopPriceAliasReason(
  stopPrice: unknown,
  triggerPrice?: unknown,
  stopPx?: unknown,
): string | null {
  if (present(stopPrice)) {
    return "Stop price alias is not supported; the adapter places market or limit";
  }
  if (present(triggerPrice)) {
    return "Trigger price alias is not supported; the adapter places market or limit";
  }
  if (present(stopPx)) {
    return "Stop px alias is not supported; the adapter places market or limit";
  }
  return null;
}
