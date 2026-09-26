/**
 * Wire risk hard-stops → persist + alerts + cancel-open-orders.
 * Import once from a server entry.
 */

import { onHardStop } from "@/lib/hard-stop-hook";
import { hydrateGridBooks } from "@/lib/strategies";
import { emitHardStopAlert } from "./alerts";
import { flattenOpenOrdersOnHalt } from "./flatten-on-halt";
import { loadGridBooks, recordPersistedHardStop } from "./persist";
import { getRuntimeMode } from "./trading-mode";

let registered = false;
let gridHydrated = false;

export function restorePersistedGridBooks(): void {
  if (gridHydrated) return;
  gridHydrated = true;
  hydrateGridBooks(loadGridBooks());
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
