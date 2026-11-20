/** Refuse external epic metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present epic, epicId, or
 * clientEpic is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach an epic or narrative tag. An epic intent
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

export function orderEpicReason(
  epic: unknown,
  epicId?: unknown,
  clientEpic?: unknown,
): string | null {
  if (present(epic)) {
    return "Epic is not supported; the adapter would place a plain spot order";
  }
  if (present(epicId)) {
    return "Epic id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientEpic)) {
    return "Client epic is not supported; the adapter would place a plain spot order";
  }
  return null;
}
