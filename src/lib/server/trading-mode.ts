/**
 * Runtime trading mode.
 * Default is always paper. Live is opt-in and requires:
 *  1. Explicit setMode("live") after operator confirmation
 *  2. Valid KUCOIN_* env credentials on the server
 * API keys are never returned from this module.
 */

import * as kucoin from "@/lib/exchange/kucoin";

export type TradingRuntimeMode = "paper" | "live";

let runtimeMode: TradingRuntimeMode = "paper";
let liveConfirmedAt: number | null = null;

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
  message: string;
};

export function getModeStatus(): ModeStatus {
  const hasCredentials = hasLiveCredentials();
  return {
    mode: runtimeMode,
    hasCredentials,
    liveConfirmedAt,
    message:
      runtimeMode === "live"
        ? "LIVE MODE — real orders may be sent to KuCoin"
        : "Paper mode — no real money at risk",
  };
}

export function setRuntimeMode(
  next: TradingRuntimeMode,
  opts: { confirmed: boolean },
): ModeStatus {
  if (next === "paper") {
    runtimeMode = "paper";
    liveConfirmedAt = null;
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

  runtimeMode = "live";
  liveConfirmedAt = Date.now();
  return getModeStatus();
}

export function assertLiveAllowed(): void {
  if (runtimeMode !== "live") {
    throw new Error("Live trading is disabled. Current mode is paper.");
  }
  if (!hasLiveCredentials()) {
    throw new Error("Live trading blocked: missing server API credentials.");
  }
}
