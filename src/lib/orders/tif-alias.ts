/** Refuse time-in-force aliases the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, blank, and false pass. A present tif, time_in_force,
 * immediateOrCancel, or fillOrKill is refused: placeLimitOrder reads
 * timeInForce only, and KuCoin createOrder is not given an IOC/FOK flag.
 * An alias would be ignored and the order would rest as GTC. This is a
 * resting floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (value === false) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function tifAliasReason(
  tif: unknown,
  timeInForceAlias?: unknown,
  immediateOrCancel?: unknown,
  fillOrKill?: unknown,
): string | null {
  if (present(tif)) {
    return "Tif is not supported; the adapter reads timeInForce";
  }
  if (present(timeInForceAlias)) {
    return "Time in force alias is not supported; the adapter reads timeInForce";
  }
  if (present(immediateOrCancel)) {
    return "Immediate or cancel is not supported; the adapter reads timeInForce";
  }
  if (present(fillOrKill)) {
    return "Fill or kill is not supported; the adapter reads timeInForce";
  }
  return null;
}
