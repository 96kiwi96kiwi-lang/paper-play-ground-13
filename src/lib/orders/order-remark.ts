/** Refuse a client remark the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present remark, tag, or clientTag is
 * refused: adapters place one plain spot order and do not forward a client
 * note, so the remark would be dropped and the order would still rest or fill.
 * Zero is present and is refused. This is a note floor, not a halt, and does
 * not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderRemarkReason(
  remark?: unknown,
  tag?: unknown,
  clientTag?: unknown,
): string | null {
  if (present(remark)) {
    return "Remark is not supported; the adapter would drop the client note";
  }
  if (present(tag)) {
    return "Tag is not supported; the adapter would drop the client note";
  }
  if (present(clientTag)) {
    return "Client tag is not supported; the adapter would drop the client note";
  }
  return null;
}
