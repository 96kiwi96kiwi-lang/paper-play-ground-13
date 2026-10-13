/** Refuse TP/SL order-type aliases the spot adapters do not attach. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present tpOrderType, slOrderType, or
 * tpslMode is refused: placeLimitOrder / placeMarketOrder place one plain spot
 * order and do not attach a take-profit or stop-loss order type, so a partial
 * or full exit would be ignored and the base size would rest or fill without
 * that exit. Zero and "Partial" are present and are refused. stopLossPrice,
 * takeProfitPrice, and attachAlgoOrds remain their own floors. This is a TP/SL
 * order-type floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function tpslOrderTypeReason(
  tpOrderType: unknown,
  slOrderType?: unknown,
  tpslMode?: unknown,
): string | null {
  if (present(tpOrderType)) {
    return "Take-profit order type is not supported; the adapter would place a plain spot order";
  }
  if (present(slOrderType)) {
    return "Stop-loss order type is not supported; the adapter would place a plain spot order";
  }
  if (present(tpslMode)) {
    return "TP/SL mode is not supported; the adapter would place a plain spot order";
  }
  return null;
}
