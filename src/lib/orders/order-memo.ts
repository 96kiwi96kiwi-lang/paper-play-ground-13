/** Refuse memo fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present memo, orderMemo,
 * or clientMemo is refused: adapters place one plain spot order and do
 * not attach a memo, so a memo intent would otherwise be dropped and
 * the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderMemoReason(
  memo: unknown,
  orderMemo?: unknown,
  clientMemo?: unknown,
): string | null {
  if (present(memo)) {
    return "Memo is not supported; the adapter would place a plain spot order";
  }
  if (present(orderMemo)) {
    return "Order memo is not supported; the adapter would place a plain spot order";
  }
  if (present(clientMemo)) {
    return "Client memo is not supported; the adapter would place a plain spot order";
  }
  return null;
}
