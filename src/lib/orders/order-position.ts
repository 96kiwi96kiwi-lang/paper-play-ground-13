/** Refuse external position metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present position, orderPosition, or
 * clientPosition is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a position or order position. A position intent
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

export function orderPositionReason(
  position: unknown,
  orderPosition?: unknown,
  clientPosition?: unknown,
): string | null {
  if (present(position)) {
    return "Position is not supported; the adapter would place a plain spot order";
  }
  if (present(orderPosition)) {
    return "Order position is not supported; the adapter would place a plain spot order";
  }
  if (present(clientPosition)) {
    return "Client position is not supported; the adapter would place a plain spot order";
  }
  return null;
}
