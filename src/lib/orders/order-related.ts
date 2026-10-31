/** Refuse related-order links the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present relatedId, orderRelated,
 * or clientRelated is refused: adapters place one plain spot order and do
 * not attach a related order, so a related-order intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderRelatedReason(
  relatedId: unknown,
  orderRelated?: unknown,
  clientRelated?: unknown,
): string | null {
  if (present(relatedId)) {
    return "Related id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderRelated)) {
    return "Order related is not supported; the adapter would place a plain spot order";
  }
  if (present(clientRelated)) {
    return "Client related is not supported; the adapter would place a plain spot order";
  }
  return null;
}
