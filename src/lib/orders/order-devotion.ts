/** Refuse external devotion metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present devotion, devotionId, or
 * orderDevotion is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a devotion or narrative tag. A devotion
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

export function orderDevotionReason(
  devotion: unknown,
  devotionId?: unknown,
  orderDevotion?: unknown,
): string | null {
  if (present(devotion)) {
    return "Devotion is not supported; the adapter would place a plain spot order";
  }
  if (present(devotionId)) {
    return "Devotion id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderDevotion)) {
    return "Order-devotion alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
