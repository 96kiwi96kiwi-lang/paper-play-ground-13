/** Refuse uuid fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present uuid, orderUuid,
 * or clientUuid is refused: adapters place one plain spot order and do
 * not attach a uuid, so a uuid-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderUuidReason(
  uuid: unknown,
  orderUuid?: unknown,
  clientUuid?: unknown,
): string | null {
  if (present(uuid)) {
    return "Uuid is not supported; the adapter would place a plain spot order";
  }
  if (present(orderUuid)) {
    return "Order uuid is not supported; the adapter would place a plain spot order";
  }
  if (present(clientUuid)) {
    return "Client uuid is not supported; the adapter would place a plain spot order";
  }
  return null;
}
