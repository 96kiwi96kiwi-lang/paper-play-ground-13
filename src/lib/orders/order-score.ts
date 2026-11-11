/** Refuse score fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present score, orderScore,
 * or clientScore is refused: adapters place one plain spot order and do
 * not attach a score, so a score-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderScoreReason(
  score: unknown,
  orderScore?: unknown,
  clientScore?: unknown,
): string | null {
  if (present(score)) {
    return "Score is not supported; the adapter would place a plain spot order";
  }
  if (present(orderScore)) {
    return "Order score is not supported; the adapter would place a plain spot order";
  }
  if (present(clientScore)) {
    return "Client score is not supported; the adapter would place a plain spot order";
  }
  return null;
}
