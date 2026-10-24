/** Refuse external account metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present account, orderAccount, or
 * clientAccount is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach an account or order account. An account intent
 * would otherwise be dropped and the order would rest or fill as a plain spot
 * order. Zero is present and is refused. This is a metadata floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderAccountReason(
  account: unknown,
  orderAccount?: unknown,
  clientAccount?: unknown,
): string | null {
  if (present(account)) {
    return "Account is not supported; the adapter would place a plain spot order";
  }
  if (present(orderAccount)) {
    return "Order account is not supported; the adapter would place a plain spot order";
  }
  if (present(clientAccount)) {
    return "Client account is not supported; the adapter would place a plain spot order";
  }
  return null;
}
