/**
 * Server-side KuCoin API-key permission audit.
 * Live mode must only run with Trade (+ General). Withdraw is never allowed.
 * Never log or return the raw key.
 */

import ccxt from "ccxt";

export type KeyPermissionAudit = {
  ok: boolean;
  trade: boolean;
  withdraw: boolean;
  transfer: boolean;
  general: boolean;
  rawPermission: string | null;
  message: string;
};

const EMPTY: KeyPermissionAudit = {
  ok: false,
  trade: false,
  withdraw: false,
  transfer: false,
  general: false,
  rawPermission: null,
  message: "Permissions not inspected",
};

function parsePermissionString(raw: string): Omit<KeyPermissionAudit, "ok" | "message"> {
  const parts = raw
    .split(/[,\s|/]+/)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  const has = (name: string) => parts.includes(name);

  return {
    trade: has("trade") || has("spot"),
    withdraw: has("withdraw") || has("withdrawal") || has("withdraws"),
    transfer: has("transfer") || has("innertransfer") || has("flextransfer"),
    general: has("general") || has("query") || parts.length === 0,
    rawPermission: raw,
  };
}

function evaluate(parsed: Omit<KeyPermissionAudit, "ok" | "message">): KeyPermissionAudit {
  if (parsed.withdraw) {
    return {
      ...parsed,
      ok: false,
      message:
        "REJECTED: API key has Withdraw permission. Create a Trade-only key and revoke this one.",
    };
  }
  if (!parsed.trade) {
    return {
      ...parsed,
      ok: false,
      message: "REJECTED: API key is missing Trade permission.",
    };
  }
  return {
    ...parsed,
    ok: true,
    message: parsed.transfer
      ? "Trade present; Transfer is enabled (Withdraw is off). Prefer Trade-only if possible."
      : "Trade-only key accepted. Withdraw is off.",
  };
}

/**
 * Best-effort read of the current key's permission string via CCXT implicit API.
 * If KuCoin does not return a permission field, we fail closed for live enablement
 * unless KUCOIN_ALLOW_UNVERIFIED_KEY=1 is set (still never allows an explicit Withdraw flag).
 */
export async function inspectKucoinKeyPermissions(): Promise<KeyPermissionAudit> {
  const apiKey = process.env.KUCOIN_API_KEY ?? "";
  const secret = process.env.KUCOIN_SECRET ?? "";
  const password = process.env.KUCOIN_PASSWORD ?? "";

  if (!apiKey || !secret || !password) {
    return { ...EMPTY, message: "Missing server KuCoin credentials." };
  }

  const ex = new ccxt.kucoin({
    apiKey,
    secret,
    password,
    enableRateLimit: true,
    options: { defaultType: "spot" },
  });

  const candidates: Array<() => Promise<unknown>> = [
    () => (ex as unknown as { privateGetUserApiKey: () => Promise<unknown> }).privateGetUserApiKey(),
    () => (ex as unknown as { privateGetApiKey: () => Promise<unknown> }).privateGetApiKey(),
  ];

  let lastError = "";
  for (const fn of candidates) {
    try {
      const raw = await fn();
      const permission = extractPermission(raw);
      if (permission) {
        return evaluate(parsePermissionString(permission));
      }
      lastError = "Response had no permission field";
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  const allowUnverified = process.env.KUCOIN_ALLOW_UNVERIFIED_KEY === "1";
  if (allowUnverified) {
    return {
      ...EMPTY,
      ok: true,
      trade: true,
      message:
        "Could not inspect key permissions (