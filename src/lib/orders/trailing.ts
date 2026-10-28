/** Refuse trailing-stop fields the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present trailingStop, trailingDelta,
 * callbackRate, or activationPrice is refused: placeLimitOrder / placeMarketOrder
 * do not send a trailing callback or activation, so a trailing intent would
 * otherwise be ignored and the order would rest or fill as a plain spot order
 * at price or market. Zero is present and is refused. This is a trailing floor,
 * not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function trailingReason(
  trailingStop: unknown,
  trailingDelta?: unknown,
  callbackRate?: unknown,
  activationPrice?: unknown,
): string | null {
  if (present(trailingStop)) {
    return "Trailing stop is not supported; the adapter would place a plain spot order";
  }
  if (present(trailingDelta)) {
    return "Trailing delta is not supported; the adapter would place a plain spot order";
  }
  if (present(callbackRate)) {
    return "Callback rate is not supported; the adapter would place a plain spot order";
  }
  if (present(activationPrice)) {
    return "Activation price is not supported; the adapter would place a plain spot order";
  }
  return null;
}
