/** Refuse a sub-account route the spot adapters do not select. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present subAccount, subUid, or uid
 * is refused: adapters authenticate the server key only and do not select a
 * sub-account, so the route would be ignored and the order would land on the
 * key account. Zero is present and is refused. This is an account floor, not
 * a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function subAccountReason(
  subAccount?: unknown,
  subUid?: unknown,
  uid?: unknown,
): string | null {
  if (present(subAccount)) {
    return "Sub account is not supported; the adapter would use the server key account";
  }
  if (present(subUid)) {
    return "Sub uid is not supported; the adapter would use the server key account";
  }
  if (present(uid)) {
    return "Uid is not supported; the adapter would use the server key account";
  }
  return null;
}
