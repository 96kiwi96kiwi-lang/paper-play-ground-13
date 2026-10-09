/** Refuse TP/SL trigger-price aliases the spot adapters do not attach. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present tpTriggerPx, slTriggerPx, or
 * tpslTriggerPx is refused: placeLimitOrder / placeMarketOrder place one plain
 * spot order and do not attach a take-profit or stop-loss trigger price, so a
 * conditional exit would be ignored and the base size would rest or fill
 * immediately. Zero and "0" are present and are refused. tpOrdPx, stopPrice,
 * takeProfitPrice, and stopLossPrice remain their own floors. This is a
 * TP/SL trigger-price floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function tpslTriggerPriceReason(
  tpTriggerPx: unknown,
  slTriggerPx?: unknown,
  tpslTriggerPx?: unknown,
): string | null {
  if (present(tpTriggerPx)) {
    return "Take-profit trigger price is not supported; the adapter would place a plain spot order";
  }
  if (present(slTriggerPx)) {
    return "Stop-loss trigger price is not supported; the adapter would place a plain spot order";
  }
  if (present(tpslTriggerPx)) {
    return "TP/SL trigger price is not supported; the adapter would place a plain spot order";
  }
  return null;
}
