/** Refuse external dream metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present dream, dreamId, or
 * orderDream is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a dream or narrative tag. A dream
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

export function orderDreamReason(
  dream: unknown,
  dreamId?: unknown,
  orderDream?: unknown,
): string | null {
  if (present(dream)) {
    return "Dream is not supported; the adapter would place a plain spot order";
  }
  if (present(dreamId)) {
    return "Dream id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderDream)) {
    return "Order-dream alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
