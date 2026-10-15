/** Refuse funds fields the spot adapters do not interpret as quote size. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present funds, quoteFunds, or fundsAmount
 * is refused: placeLimitOrder / placeMarketOrder take a base amount and do not
 * interpret a quote funds value (KuCoin market buys often use "funds"), so a funds
 * intent would otherwise be ignored and the base amount would trade. Zero is present
 * and is refused. This is a funds floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function fundsReason(
  funds: unknown,
  quoteFunds?: unknown,
  fundsAmount?: unknown,
): string | null {
  if (present(funds)) {
    return "Funds is not supported; the adapter would place a base-amount order";
  }
  if (present(quoteFunds)) {
    return "Quote funds is not supported; the adapter would place a base-amount order";
  }
  if (present(fundsAmount)) {
    return "Funds amount is not supported; the adapter would place a base-amount order";
  }
  return null;
}
