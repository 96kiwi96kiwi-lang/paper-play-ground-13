/** Refuse timezone metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present timezone, orderTimezone, or
 * clientTimezone is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a timezone. A timezone intent would
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

export function orderTimezoneReason(
  timezone?: unknown,
  orderTimezone?: unknown,
  clientTimezone?: unknown,
): string | null {
  if (present(timezone)) {
    return "Timezone is not supported; the adapter would place a plain spot order";
  }
  if (present(orderTimezone)) {
    return "Order timezone is not supported; the adapter would place a plain spot order";
  }
  if (present(clientTimezone)) {
    return "Client timezone is not supported; the adapter would place a plain spot order";
  }
  return null;
}
