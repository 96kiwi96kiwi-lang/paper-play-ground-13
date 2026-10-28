/** Refuse external fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present externalId, orderExternal,
 * or clientExternal is refused: adapters place one plain spot order and do
 * not attach an external id, so an external-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderExternalReason(
  externalId: unknown,
  orderExternal?: unknown,
  clientExternal?: unknown,
): string | null {
  if (present(externalId)) {
    return "External id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderExternal)) {
    return "Order external is not supported; the adapter would place a plain spot order";
  }
  if (present(clientExternal)) {
    return "Client external is not supported; the adapter would place a plain spot order";
  }
  return null;
}
