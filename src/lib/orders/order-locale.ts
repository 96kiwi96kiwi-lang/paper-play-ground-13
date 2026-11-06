/** Refuse locale metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present locale, orderLocale, or
 * clientLocale is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a locale. A locale intent would
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

export function orderLocaleReason(
  locale?: unknown,
  orderLocale?: unknown,
  clientLocale?: unknown,
): string | null {
  if (present(locale)) {
    return "Locale is not supported; the adapter would place a plain spot order";
  }
  if (present(orderLocale)) {
    return "Order locale is not supported; the adapter would place a plain spot order";
  }
  if (present(clientLocale)) {
    return "Client locale is not supported; the adapter would place a plain spot order";
  }
  return null;
}
