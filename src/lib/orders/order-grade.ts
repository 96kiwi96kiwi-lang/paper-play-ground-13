/** Refuse grade fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present grade, orderGrade,
 * or clientGrade is refused: adapters place one plain spot order and do
 * not attach a grade, so a grade-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderGradeReason(
  grade: unknown,
  orderGrade?: unknown,
  clientGrade?: unknown,
): string | null {
  if (present(grade)) {
    return "Grade is not supported; the adapter would place a plain spot order";
  }
  if (present(orderGrade)) {
    return "Order grade is not supported; the adapter would place a plain spot order";
  }
  if (present(clientGrade)) {
    return "Client grade is not supported; the adapter would place a plain spot order";
  }
  return null;
}
