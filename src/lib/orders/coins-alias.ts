/** Refuse coins aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present coins, orderCoins, or baseCoins
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is a coins floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function coinsAliasReason(
  coins: unknown,
  orderCoins?: unknown,
  baseCoins?: unknown,
): string | null {
  if (present(coins)) {
    return "Coins alias is not supported; the adapter reads amount";
  }
  if (present(orderCoins)) {
    return "Order coins alias is not supported; the adapter reads amount";
  }
  if (present(baseCoins)) {
    return "Base coins alias is not supported; the adapter reads amount";
  }
  return null;
}
