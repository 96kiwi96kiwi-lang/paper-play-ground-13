/**
 * Basic monitoring / alerts on hard-stop.
 * Logs loudly and persists the alert ring. Optional webhook via HARD_STOP_WEBHOOK_URL.
 */

import {
  loadRecentAlerts,
  persistRecentAlerts,
  saveBotState,
  sanitizeHardStop,
  type PersistedAlert,
  type PersistedHardStop,
} from "./persist";

export type HardStopAlert = PersistedAlert;

const recent: HardStopAlert[] = [];
const MAX = 50;
let lastFingerprint = "";
let hydrated = false;

function hydrateRecent(): void {
  if (hydrated) return;
  hydrated = true;
  const stored = loadRecentAlerts();
  if (!stored.length) return;
  recent.splice(0, recent.length, ...stored.slice(-MAX));
  const last = recent[recent.length - 1];
  if (last) lastFingerprint = `${last.reason}|${last.code ?? ""}`;
}

export function getRecentAlerts(): HardStopAlert[] {
  hydrateRecent();
  return [...recent];
}

export async function emitHardStopAlert(alert: HardStopAlert): Promise<void> {
  hydrateRecent();
  const fp = `${alert.reason}|${alert.code ?? ""}`;
  if (fp === lastFingerprint) return;
  lastFingerprint = fp;

  recent.push(alert);
  if (recent.length > MAX) recent.splice(0, recent.length - MAX);
  persistRecentAlerts(recent);

  console.error(
    `[ALERT][HARD-STOP] ${new Date(alert.at).toISOString()} ${alert.code ?? "-"} ${alert.reason} mode=${alert.mode ?? "?"}`,
  );

  const stop: PersistedHardStop = {
    at: alert.at,
    reason: alert.reason,
    code: alert.code,
  };
  saveBotState({ lastHardStop: sanitizeHardStop(stop) });

  const url = process.env.HARD_STOP_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: `HARD-STOP: ${alert.reason}`,
        alert,
      }),
    });
  } catch (err) {
    console.error("[ALERT] webhook failed", err);
  }
}
