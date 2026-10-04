/** Refuse trailing or extra trigger fields the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, and blank pass. A present trailing or extra trigger is refused:
 * placeLimitOrder / placeMarketOrder do not send these fields, so a stop-loss,
 * take-profit, callback, or activation price would be ignored and the base
 * order would fill or rest immediately. stopPrice is a separate floor.
 * This is a trigger floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function trailingReason(
  triggerPrice: unknown,
  stopLossPrice?: unknown,
  takeProfitPrice?: unknown,
  trailingDelta?: unknown,
  trailingPercent?: unknown,
  callbackRate?: unknown,
  activationPrice?: unknown,
): string | null {
  if (present(triggerPrice)) {
    return "Trigger price is not supported; the adapter would place a spot order";
  }
  if (present(stopLossPrice)) {
    return "Stop loss is not supported; the adapter would place a spot order";
  }
  if (present(takeProfitPrice)) {
    return "Take profit is not supported; the adapter would place a spot order";
  }
  if (present(trailingDelta)) {
    return "Trailing delta is not supported; the adapter would place a spot order";
  }
  if (present(trailingPercent)) {
    return "Trailing percent is not supported; the adapter would place a spot order";
  }
  if (present(callbackRate)) {
    return "Callback rate is not supported; the adapter would place a spot order";
  }
  if (present(activationPrice)) {
    return "Activation price is not supported; the adapter would place a spot order";
  }
  return null;
}
