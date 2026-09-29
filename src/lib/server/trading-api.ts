/**
 * Server-side trading API
 * -----------------------
 * Safe to call from server functions / loaders.
 * Never exposes API keys to the client.
 */

import { TRADING_CONFIG } from "@/config/trading";
import * as kucoin from "@/lib/exchange/kucoin";
import { utcDayKey } from "@/lib/risk";
import { snapshotGridBooks, type GridBook } from "@/lib/strategies";
import { assertLiveAllowed, getRuntimeMode, type TradingRuntimeMode } from "./trading-mode";
import {
  loadBotState,
  loadPaperPortfolio,
  persistPaperPortfolio,
  loadSeenOrders,
  persistSeenOrders,
  persistGridBooks,
  clearPersistedHalt,
  loadRecentAlerts,
  loadLastReject,
  type PersistedAlert,
  type PersistedHardStop,
} from "./persist";
import { checkStaleHeartbeat, recordBotHeartbeat, type BotHeartbeat } from "./heartbeat";
import { restorePersistedGridBooks } from "./register-monitoring";
import type { PortfolioSnapshot } from "@/lib/orders/order-manager";
import type { UnifiedOrder } from "@/lib/exchange/types";

export type Mode = TradingRuntimeMode;

export type HealthGridBook = {
  symbol: string;
  mid: number;
  spacingPct: number;
  lastSide?: GridBook["lastSide"];
  lastLevel?: number;
  lastFillPrice?: number;
  lastFillAt?: number;
  lastFillAgeMs: number | null;
  stackedBuys: number;
  reserved: boolean;
  /** Age of the current mid book (builtAt). */
  bookAgeMs: number | null;
  /** Remaining reservation TTL; 0 when not reserved or already expired. */
  reservationRemainingMs: number;
  reservationTtlMs: number;
};

/** One persisted paper position (cost basis, no live mark). No secrets. */
export type HealthPaperPosition = {
  symbol: string;
  amount: number;
  avgEntry: number;
  costUsd: number;
};

/** Sanitized paper inventory for health / Paper-Live cluster. No secrets. */
export type HealthPaperBook = {
  cash: number;
  used: number;
  total: number;
  positionCount: number;
  positions: HealthPaperPosition[];
};

/** UTC daily submit cap — persisted on risk.tradesToday, not a hard-stop. */
export type HealthDailyCap = {
  used: number;
  max: number;
  remaining: number;
  dayKey: string;
  exhausted: boolean;
};

/** Burst-guard clock + leftover working orders from the persisted ledger. */
export type HealthOrderWatch = {
  lastSubmitAt: number;
  lastSubmitAgeMs: number | null;
  seenOrderCount: number;
  workingOrderCount: number;
  minSubmitIntervalMs: number;
  burstCooldownMs: number;
  burstReady: boolean;
  maxConcurrentOpenOrders: number;
  maxOpenOrdersPerSymbol: number;
  workingSlotsLeft: number;
  workingAtCap: boolean;
};

/** Persisted risk counters for the dashboard. No secrets. */
export type HealthRiskWatch = {
  dailyPnlPct: number;
  drawdownPct: number;
  losingStreak: number;
  networkErrorStreak: number;
  cooldownUntil: number | null;
  cooldownRemainingMs: number;
  openPositionsCount: number;
  savedAt: number;
  stateAgeMs: number | null;
};

/** Booked cost basis vs maxGrossExposureUsd + pair allowlist + notional floors. No secrets. */
export type HealthExposureWatch = {
  usedUsd: number;
  maxGrossUsd: number;
  remainingUsd: number;
  usedPct: number;
  nearLimit: boolean;
  atLimit: boolean;
  maxOrderNotionalUsd: number;
  minOrderNotionalUsd: number;
  pairs: string[];
};

/** Last refused submit (risk / cap / adapter). Not a hard-stop. No secrets. */
export type HealthLastReject = {
  at: number;
  reason: string;
  symbol?: string;
  side?: string;
  ageMs: number | null;
};

export interface HealthResponse {
  ok: boolean;
  mode: Mode;
  message: string;
  hasCredentials: boolean;
  heartbeat?: BotHeartbeat | null;
  heartbeatAgeMs?: number | null;
  heartbeatStale?: boolean;
  lastHardStop?: PersistedHardStop | null;
  haltReason?: string | null;
  recentAlerts?: PersistedAlert[];
  gridBooks?: HealthGridBook[];
  paperBook?: HealthPaperBook | null;
  dailyCap?: HealthDailyCap;
  orderWatch?: HealthOrderWatch;
  riskWatch?: HealthRiskWatch | null;
  exposureWatch?: HealthExposureWatch;
  lastReject?: HealthLastReject | null;
}
