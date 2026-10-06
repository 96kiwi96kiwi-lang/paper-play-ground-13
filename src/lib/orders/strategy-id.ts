/** Refuse algo strategy fields the spot adapters do not attach. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present strategyId, strategyType,
 * or workingType is refused: adapters place one plain spot order and do not
 * attach an algo strategy or a mark/contract working type, so a strategy
 * intent would be ignored and the order could rest or fill immediately.
 * This is a strategy floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function strategyIdReason(
  strategyId: unknown,
  strategyType?: unknown,
  workingType?: unknown,
): string | null {
  if (present(strategyId)) {
    return "Strategy id is not supported; the adapter would place a plain spot order";
  }
  if (present(strategyType)) {
    return "Strategy type is not supported; the adapter would place a plain spot order";
  }
  if (present(workingType)) {
    return "Working type is not supported; the adapter would place a plain spot order";
  }
  return null;
}
