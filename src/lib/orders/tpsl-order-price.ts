/** Refuse TP/SL order-price aliases the spot adapters do not attach. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present tpOrdPx, slOrdPx, or tpslPx
 * is refused: placeLimitOrder / placeMarketOrder place one plain spot order
 * and do not attach a take-profit or stop-loss limit price, so an exit limit
 * would be ignored and the base size would rest or fill without that price.
 * Zero and "0" are present and are refused. tpOrderType, stopLossPrice,
 * takeProfitPrice, and attachAlgoOrds remain their own floors. This is a
 * TP/SL order-price floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function tpslOrderPriceReason(
  tpOrdPx: unknown,
  slOrdPx?: unknown,
  tpslPx?: unknown,
): string | null {
  if (present(tpOrdPx)) {
    return "Take-profit order price is not supported; the adapter would place a plain spot order";
  }
  if (present(slOrdPx)) {
    return "Stop-loss order price is not supported; the adapter would place a plain spot order";
  }
  if (present(tpslPx)) {
    return "TP/SL order price is not supported; the adapter would place a plain spot order";
  }
  return null;
}
