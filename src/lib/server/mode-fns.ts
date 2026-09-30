/**
 * Client-callable server functions for mode.
 * Responses never include API keys or secrets.
 */

import { createServerFn } from "@tanstack/react-start";
import { getModeStatus, setRuntimeMode, type ModeStatus } from "./trading-mode";
import { clearOperatorHalt, getHealth, markBotTick } from "./trading-api";
import { registerHardStopMonitoring } from "./register-monitoring";
import { assertOperatorToken } from "./operator-auth";

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
      bookAgeMs: g.bookAgeMs ?? null,
      reservationRemainingMs: g.reservationRemainingMs ?? 0,
      reservationTtlMs: g.reservationTtlMs ?? 0,
    })),
    paperBook: health.paperBook
      ? {
          cash: health.paperBook.cash,
          used: health.paperBook.used,
          total: health.paperBook.total,
          positionCount: health.paperBook.positionCount,
          positions: (health.paperBook.positions ?? []).map((pos) => ({
            symbol: pos.symbol,
            amount: pos.amount,
            avgEntry: pos.avgEntry,
            costUsd: pos.costUsd,
          })),
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
          minSubmitIntervalMs: health.orderWatch.minSubmitIntervalMs,
          burstCooldownMs: health.orderWatch.burstCooldownMs,
          burstReady: health.orderWatch.burstReady,
          maxConcurrentOpenOrders: health.orderWatch.maxConcurrentOpenOrders,
          maxOpenOrdersPerSymbol: health.orderWatch.maxOpenOrdersPerSymbol,
          workingSlotsLeft: health.orderWatch.workingSlotsLeft,
          workingAtCap: health.orderWatch.workingAtCap,
        }
      : null,
    riskWatch: health.riskWatch
      ? {
          dailyPnlPct: health.riskWatch.dailyPnlPct,
          drawdownPct: health.riskWatch.drawdownPct,
          losingStreak: health.riskWatch.losingStreak,
          networkErrorStreak: health.riskWatch.networkErrorStreak,
          cooldownUntil: health.riskWatch.cooldownUntil,
          cooldownRemainingMs: health.riskWatch.cooldownRemainingMs,
          openPositionsCount: health.riskWatch.openPositionsCount,
          savedAt: health.riskWatch.savedAt,
          stateAgeMs: health.riskWatch.stateAgeMs,
        }
      : null,
    exposureWatch: health.exposureWatch
      ? {
          usedUsd: health.exposureWatch.usedUsd,
          maxGrossUsd: health.exposureWatch.maxGrossUsd,
          remainingUsd: health.exposureWatch.remainingUsd,
          usedPct: health.exposureWatch.usedPct,
          nearLimit: health.exposureWatch.nearLimit,
          atLimit: health.exposureWatch.atLimit,
          maxOrderNotionalUsd: health.exposureWatch.maxOrderNotionalUsd,
          minOrderNotionalUsd: health.exposureWatch.minOrderNotionalUsd,
          pairs: health.exposureWatch.pairs,
        }
      : null,
    lastReject: health.lastReject
      ? {
          at: health.lastReject.at,
          reason: health.lastReject.reason,
          symbol: health.lastReject.symbol,
          side: health.lastReject.side,
          ageMs: health.lastReject.ageMs,
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
    const body = (data ?? {}) as { mode?: string; confirmed?: boolean; operatorToken?: string };
    if (body.mode !== "paper" && body.mode !== "live") {
      throw new Error("mode must be paper or live");
    }
    const operatorToken = typeof body.operatorToken === "string" ? body.operatorToken : "";
    return {
      mode: body.mode as "paper" | "live",
      confirmed: Boolean(body.confirmed),
      operatorToken,
    };
  })
  .handler(async ({ data }): Promise<ModeStatus> => {
    return setRuntimeMode(data.mode, {
      confirmed: data.confirmed,
      operatorToken: data.operatorToken,
    });
  });

/**
 * Operator acknowledgement of a persisted hard-stop.
 * Requires OPERATOR_TOKEN. Does not enable live mode.
 */
export const requestClearHalt = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const body = (data ?? {}) as { note?: string; confirmed?: boolean; operatorToken?: string };
    if (!body.confirmed) {
      throw new Error("Clearing a halt requires explicit confirmation.");
    }
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 160) : "";
    const operatorToken = typeof body.operatorToken === "string" ? body.operatorToken : "";
    return { note: note || "dashboard", confirmed: true as const, operatorToken };
  })
  .handler(async ({ data }) => {
    assertOperatorToken(data.operatorToken);
    return clearOperatorHalt(data.note);
  });
