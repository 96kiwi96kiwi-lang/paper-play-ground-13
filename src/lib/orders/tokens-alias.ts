/** Refuse tokens aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present tokens, orderTokens, or baseTokens
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is a tokens floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function tokensAliasReason(
  tokens: unknown,
  orderTokens?: unknown,
  baseTokens?: unknown,
): string | null {
  if (present(tokens)) {
    return "Tokens alias is not supported; the adapter reads amount";
  }
  if (present(orderTokens)) {
    return "Order tokens alias is not supported; the adapter reads amount";
  }
  if (present(baseTokens)) {
    return "Base tokens alias is not supported; the adapter reads amount";
  }
  return null;
}
