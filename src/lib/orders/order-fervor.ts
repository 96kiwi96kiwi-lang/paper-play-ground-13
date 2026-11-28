/** Refuse external fervor metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present fervor, fervorId, or
 * orderFervor is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a fervor or narrative tag. A fervor
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

export function orderFervorReason(
  fervor: unknown,
  fervorId?: unknown,
  orderFervor?: unknown,
): string | null {
  if (present(fervor)) {
    return "Fervor is not supported; the adapter would place a plain spot order";
  }
  if (present(fervorId)) {
    return "Fervor id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderFervor)) {
    return "Order-fervor alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
