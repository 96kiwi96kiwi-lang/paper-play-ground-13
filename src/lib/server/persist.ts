/**
 * Server-side persistent bot state.
 * LocalStorage is UI-only; this file store survives process restarts.
 * Never write API keys here.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { RiskState } from "@/lib/risk";
import type { TradingRuntimeMode } from "./trading-mode";

export type PersistedBotState = {
  version: 1;
  savedAt: number;
  mode: TradingRuntimeMode;
  liveConfirmedAt: number | null;
  risk: Pick<
    RiskState,
    | "portfolioValue"
    | "cash"
    | "openPositionsCount"
    | "dailyPnlPct"
    | "drawdownPct"
    | "losingStreak"
    | "cooldownUntil"
    | "haltReason"
    | "networkErrorStreak"
    | "lastPrices"
  > | null;
  lastHardStop: { at: number; reason: string } | null;
};

const STATE_PATH = resolve(process.cwd(), "data", "bot-state.json");

function emptyState(): PersistedBotState {
  return {
    version: 1,
    savedAt: 0,
    mode: "paper",
    liveConfirmedAt: null,
    risk: null,
    lastHardStop: null,
  };
}

export function loadBotState(): PersistedBotState {
  try {
    if (!existsSync(STATE_PATH)) return emptyState();
    const raw = JSON.parse(readFileSync(STATE_PATH, "utf8")) as Partial<PersistedBotState>;
    return {
      ...emptyState(),
      ...raw,
      version: 1,
      mode: raw.mode === "live" ? "paper" : (raw.mode ?? "paper"),
      // Always boot in paper. Live must be re-confirmed after restart.
      liveConfirmedAt: null,
    };
  } catch (err) {
    console.warn("[persist] failed to load bot-state.json", err);
    return emptyState();
  }
}

export function saveBotState(patch: Partial<PersistedBotState>): PersistedBotState {
  const current = loadBotState();
  const next: PersistedBotState = {
    ...current,
    ...patch,
    version: 1,
    savedAt: Date.now(),
  };
  try {
    mkdirSync(dirname(STATE_PATH), { recursive: true });
    writeFileSync(STATE_PATH, JSON.stringify(next, null, 2), "utf8");
  } catch (err) {
    console.error("[persist] failed to write bot-state.json", err);
  }
  return next;
}

export function persistRiskSnapshot(risk: RiskState): void {
  saveBotState({
    risk: {
      portfolioValue: risk.portfolioValue,
      cash: risk.cash,
      openPositionsCount: risk.openPositionsCount,
      dailyPnlPct: risk.dailyPnlPct,
      drawdownPct: risk.drawdownPct,
      losingStreak: risk.losingStreak,
      cooldownUntil: risk.cooldownUntil,
      haltReason: risk.haltReason,
      networkErrorStreak: risk.networkErrorStreak,
      lastPrices: risk.lastPrices,
    },
    lastHardStop: risk.haltReason
      ? { at: Date.now(), reason: risk.haltReason }
      : loadBotState().lastHardStop,
  });
}
