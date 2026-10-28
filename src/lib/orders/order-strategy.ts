/** Refuse external strategy / algo metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present strategy, strategyId, or
 * clientStrategy is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a strategy or algo tag. A strategy intent
 * would otherwise be dropped and the order would rest or fill as a plain spot
 * order. Zero is present and is refused. This is a metadata floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderStrategyReason(
  strategy: unknown,
  strategyId?: unknown,
  clientStrategy?: unknown,
): string | null {
  if (present(strategy)) {
    return "Strategy is not supported; the adapter would place a plain spot order";
  }
  if (present(strategyId)) {
    return "Strategy id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientStrategy)) {
    return "Client strategy is not supported; the adapter would place a plain spot order";
  }
  return null;
}
