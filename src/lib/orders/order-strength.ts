/** Refuse external strength metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present strength, strengthId, or
 * orderStrength is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a strength or narrative tag. A strength
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

export function orderStrengthReason(
  strength: unknown,
  strengthId?: unknown,
  orderStrength?: unknown,
): string | null {
  if (present(strength)) {
    return "Strength is not supported; the adapter would place a plain spot order";
  }
  if (present(strengthId)) {
    return "Strength id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderStrength)) {
    return "Order-strength alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
