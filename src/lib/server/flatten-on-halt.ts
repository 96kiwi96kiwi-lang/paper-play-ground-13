/**
 * On hard-stop: cancel leftover open orders.
 * Live: KuCoin cancel-all when credentials exist.
 * Paper: mark every persisted working order canceled on disk.
 * Does not place sells / does not withdraw.
 */

import * as kucoin from "@/lib/exchange/kucoin";
import { getRuntimeMode } from "./trading-mode";
import { cancelAllWorkingSeenOrdersOnDisk } from "./stale-seen";

export async function flattenOpenOrdersOnHalt(reason: string): Promise<void> {
  if (getRuntimeMode() !== "live") {
    const sweep = cancelAllWorkingSeenOrdersOnDisk();
    console.info(
      `[flatten] paper cancel-all working=${sweep.canceled} remaining=${sweep.remainingWorking} reason=${reason}`,
    );
    return;
  }
  if (!kucoin.hasCredentials()) {
    console.warn("[flatten] skip — missing credentials", reason);
    return;
  }

  try {
    const result = await kucoin.cancelAllOpenOrders();
    console.error(
      `[flatten] hard-stop cancel-all attempted=${result.attempted} canceled=${result.canceled} errors=${result.errors.length} reason=${reason}`,
    );
    for (const err of result.errors) {
      console.error("[flatten] cancel error", err);
    }
  } catch (err) {
    console.error("[flatten] cancel-all failed", err);
  }
}
