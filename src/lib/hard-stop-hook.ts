/**
 * Decouples risk engine (shared client/server) from Node-only persist/alerts.
 */

export type HardStopListener = (payload: {
  reason: string;
  code?: string;
}) => void;

const listeners: HardStopListener[] = [];

export function onHardStop(fn: HardStopListener): () => void {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function notifyHardStop(payload: { reason: string; code?: string }): void {
  for (const fn of listeners) {
    try {
      fn(payload);
    } catch (err) {
      console.error("[hard-stop-hook] listener error", err);
    }
  }
}
