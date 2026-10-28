/** Refuse crypto aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present crypto, orderCrypto, or baseCrypto
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is a crypto floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function cryptoAliasReason(
  crypto: unknown,
  orderCrypto?: unknown,
  baseCrypto?: unknown,
): string | null {
  if (present(crypto)) {
    return "Crypto alias is not supported; the adapter reads amount";
  }
  if (present(orderCrypto)) {
    return "Order crypto alias is not supported; the adapter reads amount";
  }
  if (present(baseCrypto)) {
    return "Base crypto alias is not supported; the adapter reads amount";
  }
  return null;
}
