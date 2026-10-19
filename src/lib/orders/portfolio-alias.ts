/** Refuse portfolio aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present portfolio, orderPortfolio, or basePortfolio
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is a portfolio floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function portfolioAliasReason(
  portfolio: unknown,
  orderPortfolio?: unknown,
  basePortfolio?: unknown,
): string | null {
  if (present(portfolio)) {
    return "Portfolio alias is not supported; the adapter reads amount";
  }
  if (present(orderPortfolio)) {
    return "Order portfolio alias is not supported; the adapter reads amount";
  }
  if (present(basePortfolio)) {
    return "Base portfolio alias is not supported; the adapter reads amount";
  }
  return null;
}
