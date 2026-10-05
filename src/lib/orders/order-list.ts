/** Refuse OCO and order-list fields the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present oco, order-list id, above
 * or below leg, or stop-limit price is refused: adapters place one spot
 * order and would ignore the second leg. This is a list floor, not a halt,
 * and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderListReason(
  oco: unknown,
  orderListId?: unknown,
  listClientOrderId?: unknown,
  aboveType?: unknown,
  belowType?: unknown,
  stopLimitPrice?: unknown,
): string | null {
  if (present(oco)) {
    return "OCO is not supported; the adapter places one spot order";
  }
  if (present(orderListId)) {
    return "Order list id is not supported; the adapter places one spot order";
  }
  if (present(listClientOrderId)) {
    return "List client order id is not supported; the adapter places one spot order";
  }
  if (present(aboveType)) {
    return "Above type is not supported; the adapter places one spot order";
  }
  if (present(belowType)) {
    return "Below type is not supported; the adapter places one spot order";
  }
  if (present(stopLimitPrice)) {
    return "Stop limit price is not supported; the adapter places one spot order";
  }
  return null;
}
