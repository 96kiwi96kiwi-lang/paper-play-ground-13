/** Refuse leg-order links the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present legId, orderLeg,
 * or clientLeg is refused: adapters place one plain spot order and do
 * not attach a leg, so a multi-leg intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderLegReason(
  legId: unknown,
  orderLeg?: unknown,
  clientLeg?: unknown,
): string | null {
  if (present(legId)) {
    return "Leg id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderLeg)) {
    return "Order leg is not supported; the adapter would place a plain spot order";
  }
  if (present(clientLeg)) {
    return "Client leg is not supported; the adapter would place a plain spot order";
  }
  return null;
}
