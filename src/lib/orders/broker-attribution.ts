/** Refuse broker attribution the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present brokerId, brokerClientId, or
 * rebate is refused: placeLimitOrder / placeMarketOrder do not send a broker
 * or rebate field, so an expected partner split would be ignored and the order
 * would still rest or fill on the server key account. Zero is present and is
 * refused. This is a broker floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function brokerAttributionReason(
  brokerId: unknown,
  brokerClientId?: unknown,
  rebate?: unknown,
): string | null {
  if (present(brokerId)) {
    return "Broker id is not supported; the adapter would place without broker attribution";
  }
  if (present(brokerClientId)) {
    return "Broker client id is not supported; the adapter would place without broker attribution";
  }
  if (present(rebate)) {
    return "Rebate is not supported; the adapter would place without a rebate flag";
  }
  return null;
}
