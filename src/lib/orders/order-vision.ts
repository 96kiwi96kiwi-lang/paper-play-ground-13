/** Refuse external vision metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present vision, visionId, or
 * orderVision is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a vision or narrative tag. A vision
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

export function orderVisionReason(
  vision: unknown,
  visionId?: unknown,
  orderVision?: unknown,
): string | null {
  if (present(vision)) {
    return "Vision is not supported; the adapter would place a plain spot order";
  }
  if (present(visionId)) {
    return "Vision id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderVision)) {
    return "Order-vision alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
