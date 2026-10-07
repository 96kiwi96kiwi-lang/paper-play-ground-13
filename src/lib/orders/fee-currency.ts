/** Refuse fee-asset fields the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present feeCurrency, feeCcy, or
 * deductFee is refused: placeLimitOrder / placeMarketOrder do not send a fee
 * asset, so a discount token or deduct flag would be ignored and the order
 * would still rest or fill on the default fee asset. Zero is present and is
 * refused. This is a fee floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function feeCurrencyReason(
  feeCurrency: unknown,
  feeCcy?: unknown,
  deductFee?: unknown,
): string | null {
  if (present(feeCurrency)) {
    return "Fee currency is not supported; the adapter would charge the default fee asset";
  }
  if (present(feeCcy)) {
    return "Fee asset is not supported; the adapter would charge the default fee asset";
  }
  if (present(deductFee)) {
    return "Deduct fee is not supported; the adapter would charge the default fee asset";
  }
  return null;
}
