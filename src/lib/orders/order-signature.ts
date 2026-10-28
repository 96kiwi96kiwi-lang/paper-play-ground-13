/** Refuse signature fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present signature, orderSignature,
 * or clientSignature is refused: adapters place one plain spot order and do
 * not attach a signature, so a signature-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderSignatureReason(
  signature: unknown,
  orderSignature?: unknown,
  clientSignature?: unknown,
): string | null {
  if (present(signature)) {
    return "Signature is not supported; the adapter would place a plain spot order";
  }
  if (present(orderSignature)) {
    return "Order signature is not supported; the adapter would place a plain spot order";
  }
  if (present(clientSignature)) {
    return "Client signature is not supported; the adapter would place a plain spot order";
  }
  return null;
}
