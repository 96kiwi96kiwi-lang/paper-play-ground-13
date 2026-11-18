/** Refuse stage fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present stage, orderStage,
 * or clientStage is refused: adapters place one plain spot order and do
 * not attach a stage, so a stage-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderStageReason(
  stage: unknown,
  orderStage?: unknown,
  clientStage?: unknown,
): string | null {
  if (present(stage)) {
    return "Stage is not supported; the adapter would place a plain spot order";
  }
  if (present(orderStage)) {
    return "Order stage is not supported; the adapter would place a plain spot order";
  }
  if (present(clientStage)) {
    return "Client stage is not supported; the adapter would place a plain spot order";
  }
  return null;
}
