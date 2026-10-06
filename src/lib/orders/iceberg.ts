/** Refuse an iceberg or hidden size the adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. True (or any other shape) is refused:
 * placeLimitOrder / placeMarketOrder do not send iceberg, hidden, visibleSize,
 * icebergQty, displayQty, hiddenSize, displaySize, visibleQty, or icebergSize,
 * so the full amount would rest or fill on the book. A present display size is
 * refused for the same reason. Zero is present and is refused. This is a
 * display floor, not a halt, and does not flatten positions.
 */
function presentSize(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function icebergReason(
  flag: unknown,
  visibleSize?: unknown,
  icebergQty?: unknown,
  displayQty?: unknown,
  hiddenSize?: unknown,
  displaySize?: unknown,
  visibleQty?: unknown,
  icebergSize?: unknown,
): string | null {
  if (flag != null && flag !== false && !(typeof flag === "string" && flag.trim() === "")) {
    if (flag === true) {
      return "Iceberg is not supported; the adapter would show the full size";
    }
    return "Iceberg must be omitted or false";
  }
  if (presentSize(visibleSize)) {
    return "Visible size is not supported; the adapter would show the full size";
  }
  if (presentSize(icebergQty)) {
    return "Iceberg qty is not supported; the adapter would show the full size";
  }
  if (presentSize(displayQty)) {
    return "Display qty is not supported; the adapter would show the full size";
  }
  if (presentSize(hiddenSize)) {
    return "Hidden size is not supported; the adapter would show the full size";
  }
  if (presentSize(displaySize)) {
    return "Display size is not supported; the adapter would show the full size";
  }
  if (presentSize(visibleQty)) {
    return "Visible qty is not supported; the adapter would show the full size";
  }
  if (presentSize(icebergSize)) {
    return "Iceberg size is not supported; the adapter would show the full size";
  }
  return null;
}
