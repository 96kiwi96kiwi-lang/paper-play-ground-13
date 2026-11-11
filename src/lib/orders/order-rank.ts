/** Refuse rank fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present rank, orderRank,
 * or clientRank is refused: adapters place one plain spot order and do
 * not attach a rank, so a rank-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderRankReason(
  rank: unknown,
  orderRank?: unknown,
  clientRank?: unknown,
): string | null {
  if (present(rank)) {
    return "Rank is not supported; the adapter would place a plain spot order";
  }
  if (present(orderRank)) {
    return "Order rank is not supported; the adapter would place a plain spot order";
  }
  if (present(clientRank)) {
    return "Client rank is not supported; the adapter would place a plain spot order";
  }
  return null;
}
