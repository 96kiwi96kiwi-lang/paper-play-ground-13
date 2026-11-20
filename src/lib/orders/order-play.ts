/** Refuse external play metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present play, playId, or
 * clientPlay is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a play or playbook tag. A play intent
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

export function orderPlayReason(
  play: unknown,
  playId?: unknown,
  clientPlay?: unknown,
): string | null {
  if (present(play)) {
    return "Play is not supported; the adapter would place a plain spot order";
  }
  if (present(playId)) {
    return "Play id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientPlay)) {
    return "Client play is not supported; the adapter would place a plain spot order";
  }
  return null;
}
