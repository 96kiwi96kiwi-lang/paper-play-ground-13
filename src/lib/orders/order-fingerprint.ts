/** Refuse order-fingerprint fields the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present fingerprint, orderFingerprint, or
 * clientFingerprint is refused: placeLimitOrder / placeMarketOrder do not set an
 * order fingerprint, so a fingerprint intent would be ignored and the order would
 * rest or fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderFingerprintReason(
  fingerprint?: unknown,
  orderFingerprint?: unknown,
  clientFingerprint?: unknown,
): string | null {
  if (present(fingerprint)) {
    return "Order fingerprint is not supported; the adapter would place a plain spot order";
  }
  if (present(orderFingerprint)) {
    return "Order fingerprint alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientFingerprint)) {
    return "Client fingerprint alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
