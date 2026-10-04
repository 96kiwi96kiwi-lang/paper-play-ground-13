/** Refuse self-trade prevention the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, and blank pass. A present STP mode is refused: placeLimitOrder
 * / placeMarketOrder do not send stp, so the order would rest or fill without
 * cancel-newest / cancel-old / cancel-both / decrement-and-cancel. Known KuCoin
 * codes (CN, CO, CB, DC) are present and are refused. This is a matching floor,
 * not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function selfTradeReason(
  stp: unknown,
  selfTradePrevention?: unknown,
  selfTradePreventionMode?: unknown,
): string | null {
  if (present(stp)) {
    return "STP is not supported; the adapter would place without self-trade prevention";
  }
  if (present(selfTradePrevention)) {
    return "Self-trade prevention is not supported; the adapter would place without it";
  }
  if (present(selfTradePreventionMode)) {
    return "Self-trade prevention mode is not supported; the adapter would place without it";
  }
  return null;
}
