/**
 * Runtime trading mode.
 * Default is always paper. Live is opt-in and requires:
 *  1. Explicit setMode("live") after operator confirmation
 *  2. Valid KUCOIN_* env credentials on the server
 *  3. Key permission audit: Trade present, Withdraw absent
 * API keys are never returned from this module.
 */

import * as kucoin from "@/lib/exchange/kucoin";
import {
  inspectKucoinKeyPermissions,
  type KeyPermissionAudit,
} from "@/lib/exchange/kucoin-permissions";
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
    message:
      runtimeMode === "live"
        ? "LIVE MODE — real orders may be sent to KuCoin"
        : "Paper mode — no real money at risk",
  };
}

export async function setRuntimeMode(
  next: TradingRuntimeMode,
  opts: { confirmed: boolean },
): Promise<ModeStatus> {
  if (next === "paper") {
    runtimeMode = "paper";
    liveConfirmedAt = null;
    saveBotState({ mode: "paper", liveConfirmedAt: null });
    return getModeStatus();
  }

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

export function assertLiveAllowed(): void {
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
