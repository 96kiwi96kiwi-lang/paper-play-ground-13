/** Refuse external selection metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present selection, selectionId, or
 * orderSelection is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a selection or narrative tag. A selection
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

export function orderSelectionReason(
  selection: unknown,
  selectionId?: unknown,
  orderSelection?: unknown,
): string | null {
  if (present(selection)) {
    return "Selection is not supported; the adapter would place a plain spot order";
  }
  if (present(selectionId)) {
    return "Selection id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderSelection)) {
    return "Order-selection alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
