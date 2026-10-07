/** Refuse margin side-effect fields the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present sideEffectType, sideEffect,
 * or marginEffect is refused: placeLimitOrder / placeMarketOrder do not send
 * those fields, so MARGIN_BUY, AUTO_REPAY, or AUTO_BORROW_REPAY would be
 * ignored and the base size would trade on the spot book. NO_SIDE_EFFECT is
 * present and is refused. Zero is present and is refused. Auto-borrow booleans
 * remain their own floor. This is a margin floor, not a halt, and does not
 * flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function sideEffectReason(
  sideEffectType: unknown,
  sideEffect?: unknown,
  marginEffect?: unknown,
): string | null {
  if (present(sideEffectType)) {
    return "Side effect type is not supported; the adapter would place a spot order";
  }
  if (present(sideEffect)) {
    return "Side effect is not supported; the adapter would place a spot order";
  }
  if (present(marginEffect)) {
    return "Margin effect is not supported; the adapter would place a spot order";
  }
  return null;
}
