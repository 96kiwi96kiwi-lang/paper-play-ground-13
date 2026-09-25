/**
 * Heartbeat / stalled-tick watchdog.
 * Records last successful bot tick so operators can tell if the loop died.
 * Does not place or cancel orders by itself.
 */

import { TRADING_CONFIG } from "@/config/trading";
import { loadBotState, saveBotState } from "./persist";
import { emitHardStopAlert } from "./alerts";
import { getRuntimeMode } from "./trading-mode";

export type BotHeartbeat = {
  at: number;
  symbol?: string;
  action?: string;
  hardStopped?: boolean;
};

let lastAlertAt = 0;

export function recordBotHeartbeat(partial: Omit<BotHeartbeat, "at"> & { at?: number }): BotHeartbeat {
  const beat: BotHeartbeat = {
    at: partial.at ?? Date.now(),
    symbol: partial.symbol,
    action: partial.action,
    hardStopped: partial.hardStopped,
  };
  saveBotState({ lastHeartbeat: beat });
  return beat;
}

export function getBotHeartbeat(): BotHeartbeat | null {
  return loadBotState().lastHeartbeat ?? null;
}

export function heartbeatAgeMs(now = Date.now()): number | null {
  const beat = getBotHeartbeat();
  if (!beat?.at) return null;
  return Math.max(0, now - beat.at);
}

export function isHeartbeatStale(now = Date.now()): boolean {
  const age = heartbeatAgeMs(now);
  if (age == null) return false;
  return age >= TRADING_CONFIG.orders.staleHeartbeatMs;
}

/**
 * If the last tick is older than the configured window, emit a one-shot alert.
 * Safe to call from health checks. Does not halt trading by itself.
 */
export async function checkStaleHeartbeat(now = Date.now()): Promise<{
  stale: boolean;
  ageMs: number | null;
  heartbeat: BotHeartbeat | null;
}> {
  const heartbeat = getBotHeartbeat();
  const ageMs = heartbeatAgeMs(now);
  const stale = isHeartbeatStale(now);

  if (stale && now - lastAlertAt > TRADING_CONFIG.orders.staleHeartbeatMs) {
    lastAlertAt = now;
    await emitHardStopAlert({
      at: now,
      reason: `WATCHDOG: no bot tick for ${Math.round((ageMs ?? 0) / 1000)}s (threshold ${TRADING_CONFIG.orders.staleHeartbeatMs / 1000}s)`,
      code: "stale_heartbeat",
      mode: getRuntimeMode(),
    });
  }

  return { stale, ageMs, heartbeat };
}
