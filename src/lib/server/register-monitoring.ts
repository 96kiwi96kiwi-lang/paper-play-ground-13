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

let registered = false;
let gridHydrated = false;

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

export function registerHardStopMonitoring(): void {
  restorePersistedGridBooks();
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
