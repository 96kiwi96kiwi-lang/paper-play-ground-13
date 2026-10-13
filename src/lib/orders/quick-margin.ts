/** Refuse quick-margin aliases the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present quickMgnType, quickMargin, or
 * autoLoan is refused: placeLimitOrder / placeMarketOrder do not set a quick
 * margin type, so auto-borrow or auto-repay would be ignored and the base size
 * would trade on cash. Zero and "auto_borrow" are present and are refused.
 * autoBorrow, borrowAmount, and sideEffectType remain their own floors. This is
 * a quick-margin floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function quickMarginReason(
  quickMgnType: unknown,
  quickMargin?: unknown,
  autoLoan?: unknown,
): string | null {
  if (present(quickMgnType)) {
    return "Quick margin type is not supported; the adapter would place a cash spot order";
  }
  if (present(quickMargin)) {
    return "Quick margin is not supported; the adapter would place a cash spot order";
  }
  if (present(autoLoan)) {
    return "Auto loan is not supported; the adapter would place a cash spot order";
  }
  return null;
}
