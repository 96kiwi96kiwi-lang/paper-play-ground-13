/**
 * Opt-in paper-only server tick loop.
 * Enabled with PAPER_SERVER_LOOP=1. Never starts when runtime mode is live.
 * Does not fetch exchange credentials or invent prices. Without a quoted
 * ticker the tick only sweeps stale limits / grid reservations and records
 * a heartbeat so health is no longer browser-owned.
 */

import { TRADING_CONFIG } from "@/config/trading";
import { expireStaleGridReservations } from "@/lib/strategies";
import { recordBotHeartbeat } from "./heartbeat";
import { persistGridBooks } from "./persist";
import { snapshotGridBooks } from "@/lib/strategies";
import { claimWorkerLease, restorePersistedGridBooks } from "./register-monitoring";
import { getRuntimeMode } from "./trading-mode";

export type PaperLoopStatus = {
  enabled: boolean;
  running: boolean;
  mode: "paper" | "live";
  lastTickAt: number | null;
  lastTickAgeMs: number | null;
  ticks: number;
  reason: string;
};

let timer: ReturnType<typeof setInterval> | null = null;
let ticks = 0;
let lastTickAt: number | null = null;
let lastReason = "idle";

export function paperServerLoopRequested(): boolean {
  const raw = process.env.PAPER_SERVER_LOOP?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

export function describePaperLoop(now = Date.now()): PaperLoopStatus {
  const mode = getRuntimeMode();
  const enabled = paperServerLoopRequested();
  return {
    enabled,
    running: timer != null,
    mode,
    lastTickAt,
    lastTickAgeMs: lastTickAt != null ? Math.max(0, now - lastTickAt) : null,
    ticks,
    reason: lastReason,
  };
}

/**
 * One paper housekeeping tick. Does not submit orders — quotes are not
 * invented here. Callers that later inject a ticker can extend this path.
 */
export function runPaperHousekeepingTick(now = Date.now()): PaperLoopStatus {
  restorePersistedGridBooks();
  expireStaleGridReservations();
  persistGridBooks(snapshotGridBooks());
  recordBotHeartbeat({ at: now, action: "hold", symbol: "loop" });
  ticks += 1;
  lastTickAt = now;
  lastReason = "housekeeping";
  return describePaperLoop(now);
}

export function startPaperServerLoop(): PaperLoopStatus {
  const mode = getRuntimeMode();
  if (mode !== "paper") {
    lastReason = "refused: runtime mode is not paper";
    return describePaperLoop();
  }
  if (!paperServerLoopRequested()) {
    lastReason = "disabled (set PAPER_SERVER_LOOP=1)";
    return describePaperLoop();
  }
  const claim = claimWorkerLease();
  if (!claim.ok) {
    lastReason = `standby: ${claim.reason ?? "lease held"}`;
    return describePaperLoop();
  }
  if (timer) {
    lastReason = "already running";
    return describePaperLoop();
  }
  runPaperHousekeepingTick();
  timer = setInterval(() => {
    if (getRuntimeMode() !== "paper") {
      stopPaperServerLoop("stopped: mode left paper");
      return;
    }
    runPaperHousekeepingTick();
  }, TRADING_CONFIG.botTickMs);
  if (typeof timer === "object" && timer && "unref" in timer) {
    timer.unref();
  }
  lastReason = "running";
  return describePaperLoop();
}

export function stopPaperServerLoop(reason = "stopped"): PaperLoopStatus {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  lastReason = reason;
  return describePaperLoop();
}
