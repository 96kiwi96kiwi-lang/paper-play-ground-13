/** Refuse contracts aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present contracts, orderContracts, or baseContracts
 * is refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. Zero is present and is refused.
 * This is a contracts floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function contractsAliasReason(
  contracts: unknown,
  orderContracts?: unknown,
  baseContracts?: unknown,
): string | null {
  if (present(contracts)) {
    return "Contracts alias is not supported; the adapter reads amount";
  }
  if (present(orderContracts)) {
    return "Order contracts alias is not supported; the adapter reads amount";
  }
  if (present(baseContracts)) {
    return "Base contracts alias is not supported; the adapter reads amount";
  }
  return null;
}
