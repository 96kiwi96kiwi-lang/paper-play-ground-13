/** Refuse level fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present level, orderLevel,
 * or clientLevel is refused: adapters place one plain spot order and do
 * not attach a level, so a level-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderLevelReason(
  level: unknown,
  orderLevel?: unknown,
  clientLevel?: unknown,
): string | null {
  if (present(level)) {
    return "Level is not supported; the adapter would place a plain spot order";
  }
  if (present(orderLevel)) {
    return "Order level is not supported; the adapter would place a plain spot order";
  }
  if (present(clientLevel)) {
    return "Client level is not supported; the adapter would place a plain spot order";
  }
  return null;
}
