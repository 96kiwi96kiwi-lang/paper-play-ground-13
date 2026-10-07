/** Refuse a margin borrow size the spot adapters do not apply. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present borrowAmount, borrowSize, or
 * loanAmount is refused: placeLimitOrder / placeMarketOrder size by base amount
 * and do not borrow. A loan size would be ignored and the full base amount
 * would trade on cash. Zero is present and is refused. Auto-borrow booleans
 * remain their own floor. This is a borrow floor, not a halt, and does not
 * flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function borrowSizeReason(
  borrowAmount: unknown,
  borrowSize?: unknown,
  loanAmount?: unknown,
): string | null {
  if (present(borrowAmount)) {
    return "Borrow amount is not supported; the adapter places the base size on the spot book";
  }
  if (present(borrowSize)) {
    return "Borrow size is not supported; the adapter places the base size on the spot book";
  }
  if (present(loanAmount)) {
    return "Loan amount is not supported; the adapter places the base size on the spot book";
  }
  return null;
}
