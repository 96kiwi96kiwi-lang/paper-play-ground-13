/** Refuse batch identifiers the spot adapters do not attach. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present batch, batchId, or
 * batchOrders is refused: Paper and KuCoin adapters place one plain spot
 * order and do not attach a batch or place an order list, so a batch intent
 * would be ignored and only the base size would trade. Zero is present and is
 * refused. This is a batch floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function batchReason(
  batch: unknown,
  batchId?: unknown,
  batchOrders?: unknown,
): string | null {
  if (present(batch)) {
    return "Batch is not supported; the adapter would place one plain spot order";
  }
  if (present(batchId)) {
    return "Batch id is not supported; the adapter would place one plain spot order";
  }
  if (present(batchOrders)) {
    return "Batch orders is not supported; the adapter would place one plain spot order";
  }
  return null;
}
