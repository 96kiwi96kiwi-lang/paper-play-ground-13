/** Refuse external quest metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present quest, questId, or
 * clientQuest is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a quest or narrative tag. A quest intent
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

export function orderQuestReason(
  quest: unknown,
  questId?: unknown,
  clientQuest?: unknown,
): string | null {
  if (present(quest)) {
    return "Quest is not supported; the adapter would place a plain spot order";
  }
  if (present(questId)) {
    return "Quest id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientQuest)) {
    return "Client quest is not supported; the adapter would place a plain spot order";
  }
  return null;
}
