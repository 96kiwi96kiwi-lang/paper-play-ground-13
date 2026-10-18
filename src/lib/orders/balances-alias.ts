/** Refuse balances aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present balances, orderBalances, or baseBalances
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is a balances floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function balancesAliasReason(
  balances: unknown,
  orderBalances?: unknown,
  baseBalances?: unknown,
): string | null {
  if (present(balances)) {
    return "Balances alias is not supported; the adapter reads amount";
  }
  if (present(orderBalances)) {
    return "Order balances alias is not supported; the adapter reads amount";
  }
  if (present(baseBalances)) {
    return "Base balances alias is not supported; the adapter reads amount";
  }
  return null;
}
