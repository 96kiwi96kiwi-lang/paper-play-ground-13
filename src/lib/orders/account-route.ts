/** Refuse account aliases the spot adapters do not route. Not a halt. */

/**
 * Omitted, null, and blank pass. A present account type, account, or funds
 * account is refused: adapters place on the spot trade account only. An alias
 * would be ignored and the order would land on that account. This is an
 * account floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function accountRouteReason(
  accountType: unknown,
  account?: unknown,
  fundsAccount?: unknown,
): string | null {
  if (present(accountType)) {
    return "Account type is not supported; the adapter places on the spot trade account";
  }
  if (present(account)) {
    return "Account is not supported; the adapter places on the spot trade account";
  }
  if (present(fundsAccount)) {
    return "Funds account is not supported; the adapter places on the spot trade account";
  }
  return null;
}
