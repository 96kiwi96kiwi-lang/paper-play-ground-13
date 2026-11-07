/** Refuse device metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present device, orderDevice, or
 * clientDevice is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a device. A device intent would
 * otherwise be dropped and the order would rest or fill as a plain
 * spot order. Zero is present and is refused. This is a metadata floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderDeviceReason(
  device?: unknown,
  orderDevice?: unknown,
  clientDevice?: unknown,
): string | null {
  if (present(device)) {
    return "Device is not supported; the adapter would place a plain spot order";
  }
  if (present(orderDevice)) {
    return "Order device is not supported; the adapter would place a plain spot order";
  }
  if (present(clientDevice)) {
    return "Client device is not supported; the adapter would place a plain spot order";
  }
  return null;
}
