/** Refuse attached brackets the spot adapters do not place. Not a halt. */

/**
 * Omitted, null, false, blank, and an empty attach list pass. A present
 * attachAlgoOrds payload, or a present tpTriggerPx or slTriggerPx, is refused:
 * adapters place one plain spot order and do not attach a take-profit or
 * stop-loss algo, so the bracket would be ignored and the base size would
 * trade. Zero is present and is refused. This is a bracket floor, not a halt,
 * and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

export function attachAlgoReason(
  attachAlgoOrds?: unknown,
  tpTriggerPx?: unknown,
  slTriggerPx?: unknown,
): string | null {
  if (present(attachAlgoOrds)) {
    return "Attached algo is not supported; the adapter would place a plain spot order";
  }
  if (present(tpTriggerPx)) {
    return "Take-profit trigger is not supported; the adapter would place a plain spot order";
  }
  if (present(slTriggerPx)) {
    return "Stop-loss trigger is not supported; the adapter would place a plain spot order";
  }
  return null;
}
