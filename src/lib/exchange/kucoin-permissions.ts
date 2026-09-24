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

function extractPermission(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const data = (obj.data ?? obj) as Record<string, unknown>;
  const candidates = [data.permission, data.permissions, data.perm, obj.permission];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c;
    if (Array.isArray(c)) return c.map(String).join(",");
  }
  if (Array.isArray(data)) {
    const first = data[0] as Record<string, unknown> | undefined;
    if (first && typeof first.permission === "string") return first.permission;
  }
  return null;
}

/**
 * Best-effort read of the current key's permission string via CCXT implicit API.
 * Fail closed for live enablement unless KUCOIN_ALLOW_UNVERIFIED_KEY=1.
 * An explicit Withdraw flag is never allowed.
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

  const implicit = ex as unknown as Record<string, unknown>;
  const methodNames = ["privateGetUserApiKey", "privateGetApiKey"];

  let lastError = "no implicit permission endpoint available";
  for (const name of methodNames) {
    const fn = implicit[name];
    if (typeof fn !== "function") continue;
    try {
      const raw = await (fn as () => Promise<unknown>).call(ex);
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
      message: `Could not inspect key permissions (${lastError}). KUCOIN_ALLOW_UNVERIFIED_KEY=1 — live allowed without audit.`,
    };
  }

  return {
    ...EMPTY,
    ok: false,
    message: `Could not verify key permissions (${lastError}). Live blocked. Set KUCOIN_ALLOW_UNVERIFIED_KEY=1 only after you confirmed Withdraw is off on KuCoin.`,
  };
}
