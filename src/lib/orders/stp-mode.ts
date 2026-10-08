/** Refuse STP aliases the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present stpMode, smpType, or
 * preventSelfTrade is refused: placeLimitOrder / placeMarketOrder do not send
 * a self-trade mode, so cancel-newest or expire-taker would be ignored and the
 * order could match the same account. Zero is present and is refused. stp,
 * selfTradePrevention, and selfTradePreventionMode remain their own floor.
 * This is a matching floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function stpModeReason(
  stpMode: unknown,
  smpType?: unknown,
  preventSelfTrade?: unknown,
): string | null {
  if (present(stpMode)) {
    return "STP mode is not supported; the adapter would place without self-trade prevention";
  }
  if (present(smpType)) {
    return "SMP type is not supported; the adapter would place without self-trade prevention";
  }
  if (present(preventSelfTrade)) {
    return "Prevent self trade is not supported; the adapter would place without self-trade prevention";
  }
  return null;
}
