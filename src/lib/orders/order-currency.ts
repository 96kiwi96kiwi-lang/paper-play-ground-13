/** Refuse currency metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present currency, orderCurrency, or
 * clientCurrency is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a currency. A currency intent would
 * otherwise be dropped and the order would rest or fill as a plain
 * spot order. Zero is present and is refused. This is a metadata floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderCurrencyReason(
  currency?: unknown,
  orderCurrency?: unknown,
  clientCurrency?: unknown,
): string | null {
  if (present(currency)) {
    return "Currency is not supported; the adapter would place a plain spot order";
  }
  if (present(orderCurrency)) {
    return "Order currency is not supported; the adapter would place a plain spot order";
  }
  if (present(clientCurrency)) {
    return "Client currency is not supported; the adapter would place a plain spot order";
  }
  return null;
}
