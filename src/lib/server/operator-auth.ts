/**
 * Operator token for privileged actions (enable live, clear halt).
 * Token lives in process.env.OPERATOR_TOKEN only — never invent or commit a value.
 * Missing token → fail closed. Wrong token → same public error (no oracle).
 */

import { timingSafeEqual } from "node:crypto";

export const OPERATOR_AUTH_ERROR = "LIVE_MODE_DISABLED_PENDING_OPERATOR_AUTH";

function expectedToken(): string {
  return (process.env.OPERATOR_TOKEN ?? "").trim();
}

export function operatorTokenConfigured(): boolean {
  return expectedToken().length > 0;
}

export function assertOperatorConfigured(): void {
  if (!operatorTokenConfigured()) {
    throw new Error(OPERATOR_AUTH_ERROR);
  }
}

function tokensMatch(expected: string, provided: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

/** Compare a client-supplied token to OPERATOR_TOKEN. Never logs either value. */
export function assertOperatorToken(provided?: string | null): void {
  const expected = expectedToken();
  if (!expected) {
    throw new Error(OPERATOR_AUTH_ERROR);
  }
  const got = (provided ?? "").trim();
  if (!got || !tokensMatch(expected, got)) {
    throw new Error(OPERATOR_AUTH_ERROR);
  }
}
