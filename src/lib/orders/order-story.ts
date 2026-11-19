/** Refuse external story metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present story, storyId, or
 * clientStory is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a story or narrative tag. A story intent
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

export function orderStoryReason(
  story: unknown,
  storyId?: unknown,
  clientStory?: unknown,
): string | null {
  if (present(story)) {
    return "Story is not supported; the adapter would place a plain spot order";
  }
  if (present(storyId)) {
    return "Story id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientStory)) {
    return "Client story is not supported; the adapter would place a plain spot order";
  }
  return null;
}
