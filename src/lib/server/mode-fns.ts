/**
 * Client-callable server functions for mode.
 * Responses never include API keys or secrets.
 */

import { createServerFn } from "@tanstack/react-start";
import { getModeStatus, setRuntimeMode, type ModeStatus } from "./trading-mode";
import { clearOperatorHalt, getHealth, markBotTick } from "./trading-api";
import { registerHardStopMonitoring } from "./register-monitoring";

registerHardStopMonitoring();

export const fetchModeStatus = createServerFn({ method: "GET" }).handler(async (): Promise<ModeStatus> => {
  return getModeStatus();
});

export const fetchExchangeHealth = createServerFn({ method: "GET" }).handler(async () => {
  const health = await getHealth();
  return {
    ok: health.ok,
    mode: health.mode,
    message: health.message,
    hasCredentials: health.hasCredentials,
    heartbeatAgeMs: health.heartbeatAgeMs ?? null,
    heartbeatStale: health.heartbeatStale ?? false,
    lastTickAt: health.heartbeat?.at ?? null,
    lastTickSymbol: health.heartbeat?.symbol ?? null,
    lastHardStop: health.lastHardStop ?? null,
    haltReason: health.haltReason ?? null,
    recentAlerts: (health.recentAlerts ?? []).slice(-10).map((a) => ({
      at: a.at,
      reason: a.reason,
      code: a.code,
      mode: a.mode,
    })),
    gridBooks: (health.gridBooks ?? []).map((g) => ({
      symbol: g.symbol,
      mid: g.mid,
      spacingPct: g.spacingPct,
      lastSide: g.lastSide,
      lastLevel: g.lastLevel,
      lastFillPrice: g.lastFillPrice,
      lastFillAgeMs: g.lastFillAgeMs,
      stackedBuys: g.stackedBuys,
      reserved: g.reserved,
    })),
    paperBook: health.paperBook
      ? {
          cash: health.paperBook.cash,
          used: health.paperBook.used,
          total: health.paperBook.total,
          positionCount: health.paperBook.positionCount,
        }
      : null,
    dailyCap: health.dailyCap
      ? {
          used: health.dailyCap.used,
          max: health.dailyCap.max,
          remaining: health.dailyCap.remaining,
          dayKey: health.dailyCap.dayKey,
          exhausted: health.dailyCap.exhausted,
        }
      : null,
    orderWatch: health.orderWatch
      ? {
          lastSubmitAt: health.orderWatch.lastSubmitAt,
          lastSubmitAgeMs: health.orderWatch.lastSubmitAgeMs,
          seenOrderCount: health.orderWatch.seenOrderCount,
          workingOrderCount: health.orderWatch.workingOrderCount,
        }
      : null,
  };
});

export const markBotTickFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const body = (data ?? {}) as { symbol?: string; action?: string; hardStopped?: boolean };
    return {
      symbol: typeof body.symbol === "string" ? body.symbol : undefined,
      action: typeof body.action === "string" ? body.action : undefined,
      hardStopped: Boolean(body.hardStopped),
    };
  })
  .handler(async ({ data }) => {
    markBotTick(data);
    return { ok: true as const };
  });

export const requestSetMode = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const body = (data ?? {}) as { mode?: string; confirmed?: boolean };
    if (body.mode !== "paper" && body.mode !== "live") {
      throw new Error("mode must be paper or live");
    }
    return { mode: body.mode as "paper" | "live", confirmed: Boolean(body.confirmed) };
  })
  .handler(async ({ data }): Promise<ModeStatus> => {
    return setRuntimeMode(data.mode, { confirmed: data.confirmed });
  });

/**
 * Operator acknowledgement of a persisted hard-stop.
 * Does not enable live mode. Daily PnL / drawdown can halt again if still breached.
 */
export const requestClearHalt = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const body = (data ?? {}) as { note?: string; confirmed?: boolean };
    if (!body.confirmed) {
      throw new Error("Clearing a halt requires explicit confirmation.");
    }
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 160) : "";
    return { note: note || "dashboard", confirmed: true as const };
  })
  .handler(async ({ data }) => {
    return clearOperatorHalt(data.note);
  });
