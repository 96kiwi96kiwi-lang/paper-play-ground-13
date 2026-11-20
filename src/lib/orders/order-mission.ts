/** Refuse external mission metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present mission, missionId, or
 * clientMission is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a mission or narrative tag. A mission intent
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

export function orderMissionReason(
  mission: unknown,
  missionId?: unknown,
  clientMission?: unknown,
): string | null {
  if (present(mission)) {
    return "Mission is not supported; the adapter would place a plain spot order";
  }
  if (present(missionId)) {
    return "Mission id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientMission)) {
    return "Client mission is not supported; the adapter would place a plain spot order";
  }
  return null;
}
