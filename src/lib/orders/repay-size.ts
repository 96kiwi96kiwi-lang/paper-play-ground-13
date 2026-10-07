/** Refuse a margin repay size the spot adapters do not apply. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present repayAmount, repaySize, or
 * debtAmount is refused: placeLimitOrder / placeMarketOrder size by base amount
 * and do not repay. A repay size would be ignored and the full base amount
 * would still trade on the spot book. Zero is present and is refused.
 * Auto-repay booleans remain their own floor. This is a repay floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function repaySizeReason(
  repayAmount: unknown,
  repaySize?: unknown,
  debtAmount?: unknown,
): string | null {
  if (present(repayAmount)) {
    return "Repay amount is not supported; the adapter places the base size on the spot book";
  }
  if (present(repaySize)) {
    return "Repay size is not supported; the adapter places the base size on the spot book";
  }
  if (present(debtAmount)) {
    return "Debt amount is not supported; the adapter places the base size on the spot book";
  }
  return null;
}
