/** Refuse currency aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present currency, orderCurrency, or baseCurrency
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is a currency floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function currencyAliasReason(
  currency: unknown,
  orderCurrency?: unknown,
  baseCurrency?: unknown,
): string | null {
  if (present(currency)) {
    return "Currency alias is not supported; the adapter reads amount";
  }
  if (present(orderCurrency)) {
    return "Order currency alias is not supported; the adapter reads amount";
  }
  if (present(baseCurrency)) {
    return "Base currency alias is not supported; the adapter reads amount";
  }
  return null;
}
