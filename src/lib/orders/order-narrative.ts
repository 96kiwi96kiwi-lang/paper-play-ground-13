/** Refuse external narrative metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present narrative, narrativeId, or
 * clientNarrative is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a narrative or story tag. A narrative intent
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

export function orderNarrativeReason(
  narrative: unknown,
  narrativeId?: unknown,
  clientNarrative?: unknown,
): string | null {
  if (present(narrative)) {
    return "Narrative is not supported; the adapter would place a plain spot order";
  }
  if (present(narrativeId)) {
    return "Narrative id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientNarrative)) {
    return "Client narrative is not supported; the adapter would place a plain spot order";
  }
  return null;
}
