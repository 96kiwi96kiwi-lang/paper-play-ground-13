/** Refuse TP/SL trigger-source aliases the spot adapters do not price. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present tpTriggerBy, slTriggerBy, or
 * triggerPxType is refused: placeLimitOrder / placeMarketOrder place one plain
 * spot order and do not price a take-profit or stop-loss off last, mark, or
 * index, so a mark or index stop would be ignored and the base size would rest
 * or fill immediately. Zero and "0" are present and are refused. tpTriggerPx,
 * slTriggerPx, and tpslTriggerPx remain the trigger-price floor. This is a
 * TP/SL trigger-source floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function tpslTriggerByReason(
  tpTriggerBy: unknown,
  slTriggerBy?: unknown,
  triggerPxType?: unknown,
): string | null {
  if (present(tpTriggerBy)) {
    return "Take-profit trigger source is not supported; the adapter would place a plain spot order";
  }
  if (present(slTriggerBy)) {
    return "Stop-loss trigger source is not supported; the adapter would place a plain spot order";
  }
  if (present(triggerPxType)) {
    return "Trigger price type is not supported; the adapter would place a plain spot order";
  }
  return null;
}
