/** Refuse trigger-source fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present workingType, stopWorkingType,
 * or triggerBy is refused: adapters place at price or as a market and do not
 * select a mark, index, or last trigger, so a working-type intent would be
 * ignored and the order could rest or fill on the spot book. This is a
 * trigger-source floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function workingTypeReason(
  workingType: unknown,
  stopWorkingType?: unknown,
  triggerBy?: unknown,
): string | null {
  if (present(workingType)) {
    return "Working type is not supported; the adapter would place without a mark or last trigger";
  }
  if (present(stopWorkingType)) {
    return "Stop working type is not supported; the adapter would place without a mark or last trigger";
  }
  if (present(triggerBy)) {
    return "Trigger by is not supported; the adapter would place without a mark or last trigger";
  }
  return null;
}
