/**
 * Runtime trading mode.
 * Default is always paper. Live is opt-in and requires:
 *  1. OPERATOR_TOKEN set on the server and supplied on the enable request
 *  2. Explicit setMode("live") after operator confirmation
 *  3. Valid KUCOIN_* env credentials on the server
 *  4. Key permission audit: Trade present, Withdraw absent
 * API keys and the operator token are never returned from this module.
 */

import * as kucoin from "@/lib/exchange/kucoin";
import {
  inspectKucoinKeyPermissions,
  type KeyPermissionAudit,
} from "@/lib/exchange/kucoin-permissions";
import {
  assertOperatorConfigured,
  assertOperatorToken,
  operatorTokenConfigured,
} from "./operator-auth";
import { saveBotState } from "./persist";

export type TradingRuntimeMode = "paper" | "live";

let runtimeMode: TradingRuntimeMode = "paper";
let liveConfirmedAt: number | null = null;
let lastKeyAudit: KeyPermissionAudit | null = null;

export function getRuntimeMode(): TradingRuntimeMode {
  return runtimeMode;
}

export function hasLiveCredentials(): boolean {
  return kucoin.hasCredentials();
}

export type ModeStatus = {
  mode: TradingRuntimeMode;
  hasCredentials: boolean;
  liveConfirmedAt: number | null;
  tradeOnly: boolean | null;
  withdrawDisabled: boolean | null;
  keyAuditMessage: string | null;
  operatorAuthConfigured: boolean;
  message: string;
};

export function getModeStatus(): ModeStatus {
  const hasCredentials = hasLiveCredentials();
  return {
    mode: runtimeMode,
    hasCredentials,
    liveConfirmedAt,
    tradeOnly: lastKeyAudit ? lastKeyAudit.trade && !lastKeyAudit.withdraw : null,
    withdrawDisabled: lastKeyAudit ? !lastKeyAudit.withdraw : null,
    keyAuditMessage: lastKeyAudit?.message ?? null,
    operatorAuthConfigured: operatorTokenConfigured(),
    message:
      runtimeMode === "live"
        ? "LIVE MODE — real orders may be sent to KuCoin"
        : "Paper mode — no real money at risk",
  };
}

export async function setRuntimeMode(
  next: TradingRuntimeMode,
  opts: { confirmed: boolean; operatorToken?: string | null },
): Promise<ModeStatus> {
  if (next === "paper") {
    runtimeMode = "paper";
    liveConfirmedAt = null;
    saveBotState({ mode: "paper", liveConfirmedAt: null });
    return getModeStatus();
  }

  assertOperatorToken(opts.operatorToken);

  if (!opts.confirmed) {
    throw new Error("Live mode requires explicit confirmation.");
  }
  if (!hasLiveCredentials()) {
    throw new Error(
      "Cannot enable live: KUCOIN_API_KEY, KUCOIN_SECRET and KUCOIN_PASSWORD must be set on the server.",
    );
  }

  const audit = await inspectKucoinKeyPermissions();
  lastKeyAudit = audit;
  if (!audit.ok || audit.withdraw) {
    throw new Error(
      audit.message || "Cannot enable live: API key permission audit failed (Withdraw must be off).",
    );
  }

  runtimeMode = "live";
  liveConfirmedAt = Date.now();
  saveBotState({ mode: "live", liveConfirmedAt });
  console.warn("[mode] LIVE MODE enabled at", new Date(liveConfirmedAt).toISOString());
  console.warn("[mode] key audit:", audit.message);
  return getModeStatus();
}

export function assertLiveDeploymentEnabled(): void {
  assertOperatorConfigured();
}

export function assertLiveAllowed(): void {
  assertLiveDeploymentEnabled();
  if (runtimeMode !== "live") {
    throw new Error("Live trading is disabled. Current mode is paper.");
  }
  if (!hasLiveCredentials()) {
    throw new Error("Live trading blocked: missing server API credentials.");
  }
  if (lastKeyAudit?.withdraw) {
    runtimeMode = "paper";
    throw new Error("Live trading blocked: API key has Withdraw permission.");
  }
}
