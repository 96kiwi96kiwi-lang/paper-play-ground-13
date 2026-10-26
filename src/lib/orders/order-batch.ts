/** Refuse batch fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present batch, orderBatch,
 * or clientBatch is refused: adapters place one plain spot order and do
 * not attach a batch id, so a batch-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderBatchReason(
  batch: unknown,
  orderBatch?: unknown,
  clientBatch?: unknown,
): string | null {
  if (present(batch)) {
    return "Batch is not supported; the adapter would place a plain spot order";
  }
  if (present(orderBatch)) {
    return "Order batch is not supported; the adapter would place a plain spot order";
  }
  if (present(clientBatch)) {
    return "Client batch is not supported; the adapter would place a plain spot order";
  }
  return null;
}
