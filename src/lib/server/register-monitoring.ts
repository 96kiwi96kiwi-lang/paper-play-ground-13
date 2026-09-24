/**
 * Wire risk hard-stops → persist + alerts + cancel-open-orders.
 * Import once from a server entry.
 */

import { onHardStop } from "@/lib/hard-stop-hook";
import { emitHardStopAlert } from "./alerts";
import { flattenOpenOrdersOnHalt } from "./flatten-on-halt";
import { getRuntimeMode } from "./trading-mode";

let registered = false;

export function registerHardStopMonitoring(): void {
  if (registered) return;
  registered = true;
  onHardStop(({ reason, code }) => {
    void emitHardStopAlert({
      at: Date.now(),
      reason,
      code,
      mode: getRuntimeMode(),
    });
    void flattenOpenOrdersOnHalt(reason);
  });
}
