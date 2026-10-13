/** Refuse trigger-direction aliases the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present triggerDirection, stopDirection,
 * or triggerDir is refused: placeLimitOrder / placeMarketOrder do not send a
 * trigger direction, so an up or down stop would be ignored and the base size
 * would rest or fill as a plain spot order. Zero and "up" are present and are
 * refused. stopPrice, triggerPrice, and workingType remain their own floors.
 * This is a trigger-direction floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function triggerDirectionReason(
  triggerDirection: unknown,
  stopDirection?: unknown,
  triggerDir?: unknown,
): string | null {
  if (present(triggerDirection)) {
    return "Trigger direction is not supported; the adapter would place a plain spot order";
  }
  if (present(stopDirection)) {
    return "Stop direction is not supported; the adapter would place a plain spot order";
  }
  if (present(triggerDir)) {
    return "Trigger dir is not supported; the adapter would place a plain spot order";
  }
  return null;
}
