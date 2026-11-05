/** Refuse order-signature flags the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present signature, orderSignature, or
 * clientSignature is refused: placeLimitOrder / placeMarketOrder do not set an
 * order signature, so a signature intent would be ignored and the order would rest or
 * fill as a plain spot order. Zero is present and is refused. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderSignatureReason(
  signature?: unknown,
  orderSignature?: unknown,
  clientSignature?: unknown,
): string | null {
  if (present(signature)) {
    return "Order signature is not supported; the adapter would place a plain spot order";
  }
  if (present(orderSignature)) {
    return "Order signature alias is not supported; the adapter would place a plain spot order";
  }
  if (present(clientSignature)) {
    return "Client signature alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
