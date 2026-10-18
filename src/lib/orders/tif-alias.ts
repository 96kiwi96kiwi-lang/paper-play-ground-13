/** Refuse tif aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present tif, orderTif, or timeInForceAlias is
 * refused: adapters place by timeInForce only. An alias would be ignored and the
 * order would use the canonical timeInForce or fail. This is a tif floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function tifAliasReason(
  tif: unknown,
  orderTif?: unknown,
  timeInForceAlias?: unknown,
  immediateOrCancel?: unknown,
  fillOrKill?: unknown,
): string | null {
  if (present(tif)) {
    return "Tif alias is not supported; the adapter reads timeInForce";
  }
  if (present(orderTif)) {
    return "Order tif alias is not supported; the adapter reads timeInForce";
  }
  if (present(timeInForceAlias)) {
    return "Time in force alias is not supported; the adapter reads timeInForce";
  }
  if (immediateOrCancel !== false && present(immediateOrCancel)) {
    return "Immediate or cancel is not supported; the adapter reads timeInForce";
  }
  if (fillOrKill !== false && present(fillOrKill)) {
    return "Fill or kill is not supported; the adapter reads timeInForce";
  }
  return null;
}
