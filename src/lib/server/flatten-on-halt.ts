/**
 * On hard-stop in LIVE mode, cancel leftover open orders.
 * Does not place sells / does not withdraw. Paper is a no-op.
 */

import * as kucoin from "@/lib/exchange/kucoin";
import { getRuntimeMode } from "./trading-mode";

export async function flattenOpenOrdersOnHalt(reason: string): Promise<void> {
  if (getRuntimeMode() !== "live") {
    console.info("[flatten] skip — not live", reason);
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
