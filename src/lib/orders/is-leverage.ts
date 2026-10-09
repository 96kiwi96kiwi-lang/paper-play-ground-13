/** Refuse Binance is-leverage aliases the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present isLeverage, leverageFlag, or
 * marginLeverage is refused: placeLimitOrder / placeMarketOrder do not send a
 * margin-leverage flag, so a borrow-on-spot intent would be ignored and the
 * base size would trade on cash. Zero and "TRUE" are present and are refused.
 * leverage, marginMode, and isMargin remain their own floors. This is a
 * leverage-flag floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function isLeverageReason(
  isLeverage: unknown,
  leverageFlag?: unknown,
  marginLeverage?: unknown,
): string | null {
  if (present(isLeverage)) {
    return "Is-leverage is not supported; the adapter would place a spot order";
  }
  if (present(leverageFlag)) {
    return "Leverage flag is not supported; the adapter would place a spot order";
  }
  if (present(marginLeverage)) {
    return "Margin leverage is not supported; the adapter would place a spot order";
  }
  return null;
}
