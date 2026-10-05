/** Refuse credentials on the order body. Not a halt. */

/**
 * Omitted, null, and blank pass. A present API key, secret, passphrase, or
 * signature is refused: adapters authenticate from server environment only.
 * A client credential would be ignored and could land in a reject log. This
 * is a credential floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function credentialBodyReason(
  apiKey: unknown,
  apiSecret?: unknown,
  secret?: unknown,
  passphrase?: unknown,
  signature?: unknown,
): string | null {
  if (present(apiKey)) {
    return "API key is not supported; credentials stay in server environment";
  }
  if (present(apiSecret)) {
    return "API secret is not supported; credentials stay in server environment";
  }
  if (present(secret)) {
    return "Secret is not supported; credentials stay in server environment";
  }
  if (present(passphrase)) {
    return "Passphrase is not supported; credentials stay in server environment";
  }
  if (present(signature)) {
    return "Signature is not supported; the server signs requests";
  }
  return null;
}
