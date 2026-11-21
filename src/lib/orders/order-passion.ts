/** Refuse external passion metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present passion, passionId, or
 * orderPassion is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a passion or narrative tag. A passion
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

export function orderPassionReason(
  passion: unknown,
  passionId?: unknown,
  orderPassion?: unknown,
): string | null {
  if (present(passion)) {
    return "Passion is not supported; the adapter would place a plain spot order";
  }
  if (present(passionId)) {
    return "Passion id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderPassion)) {
    return "Order-passion alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
