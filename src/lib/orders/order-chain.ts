/** Refuse chain-order links the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present chainId, orderChain,
 * or clientChain is refused: adapters place one plain spot order and do
 * not attach a chain, so a multi-order chain intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderChainReason(
  chainId: unknown,
  orderChain?: unknown,
  clientChain?: unknown,
): string | null {
  if (present(chainId)) {
    return "Chain id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderChain)) {
    return "Order chain is not supported; the adapter would place a plain spot order";
  }
  if (present(clientChain)) {
    return "Client chain is not supported; the adapter would place a plain spot order";
  }
  return null;
}
