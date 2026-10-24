/** Refuse version fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present version, orderVersion,
 * or clientVersion is refused: adapters place one plain spot order and do
 * not attach a version, so a version-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderVersionReason(
  version: unknown,
  orderVersion?: unknown,
  clientVersion?: unknown,
): string | null {
  if (present(version)) {
    return "Version is not supported; the adapter would place a plain spot order";
  }
  if (present(orderVersion)) {
    return "Order version is not supported; the adapter would place a plain spot order";
  }
  if (present(clientVersion)) {
    return "Client version is not supported; the adapter would place a plain spot order";
  }
  return null;
}
