/**
 * Basic monitoring / alerts on hard-stop.
 * Logs loudly and persists last alert. Optional webhook via HARD_STOP_WEBHOOK_URL.
 */

import { saveBotState, sanitizeHardStop, type PersistedHardStop } from "./persist";

export type HardStopAlert = {
  at: number;
  reason: string;
  code?: string;
  mode?: string;
};

const recent: HardStopAlert[] = [];
const MAX = 50;
let lastFingerprint = "";

export function getRecentAlerts(): HardStopAlert[] {
  return [...recent];
}

export async function emitHardStopAlert(alert: HardStopAlert): Promise<void> {
  const fp = `${alert.reason}|${alert.code ?? ""}`;
  if (fp === lastFingerprint) return;
  lastFingerprint = fp;

  recent.push(alert);
  if (recent.length > MAX) recent.splice(0, recent.length - MAX);

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
