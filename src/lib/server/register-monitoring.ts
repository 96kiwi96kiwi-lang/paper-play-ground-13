/**
 * Wire risk hard-stops → persist + alerts + cancel-open-orders.
 * Import once from a server entry.
 */

import { onHardStop } from "@/lib/hard-stop-hook";
import { hydrateGridBooks, snapshotGridBooks } from "@/lib/strategies";
import { emitHardStopAlert } from "./alerts";
import { flattenOpenOrdersOnHalt } from "./flatten-on-halt";
import { loadGridBooks, persistGridBooks, recordPersistedHardStop } from "./persist";
import { getRuntimeMode } from "./trading-mode";
import { acquireWorkerLease } from "./worker-lease";

let registered = false;
let gridHydrated = false;
let leaseOwnerId: string | null = null;
let loopArmed = false;

function thisWorkerId(): string {
  return process.env.WORKER_ID?.trim() || `pid-${process.pid}`;
}

/**
 * Load grid books from disk once.
 * hydrateGridBooks remaps/drops lastLevel and expires stale reservations.
 * Write that sanitized snapshot back immediately so a crash before the next
 * markBotTick cannot restore a phantom lastLevel or a dead reservation.
 */
export function restorePersistedGridBooks(): void {
  if (gridHydrated) return;
  gridHydrated = true;
  hydrateGridBooks(loadGridBooks());
  persistGridBooks(snapshotGridBooks());
}

/** Try to become the single trading worker. Safe to call repeatedly. */
export function claimWorkerLease(): { ok: boolean; ownerId: string; reason?: string } {
  const ownerId = thisWorkerId();
  const result = acquireWorkerLease(ownerId);
  if (result.ok) {
    leaseOwnerId = ownerId;
    if (result.stolen) {
      console.warn(`[lease] stole expired lease as ${ownerId}`);
    }
    return { ok: true, ownerId };
  }
  return { ok: false, ownerId, reason: result.reason };
}

export function getClaimedWorkerId(): string | null {
  return leaseOwnerId;
}

function armPaperLoop(): void {
  if (loopArmed) return;
  loopArmed = true;
  void import("./paper-loop").then(({ startPaperServerLoop }) => {
    const status = startPaperServerLoop();
    console.info(`[paper-loop] ${status.reason} running=${status.running} enabled=${status.enabled}`);
  });
}

export function registerHardStopMonitoring(): void {
  restorePersistedGridBooks();
  const claim = claimWorkerLease();
  if (!claim.ok) {
    console.warn(`[lease] this process is standby: ${claim.reason}`);
  }
  armPaperLoop();
  if (registered) return;
  registered = true;
  onHardStop(({ reason, code }) => {
    recordPersistedHardStop(reason, code);
    void emitHardStopAlert({
      at: Date.now(),
      reason,
      code,
      mode: getRuntimeMode(),
    });
    void flattenOpenOrdersOnHalt(reason);
  });
}
