/**
 * Client-callable server functions for mode.
 * Responses never include API keys or secrets.
 */

import { createServerFn } from "@tanstack/react-start";
import { getModeStatus, setRuntimeMode, type ModeStatus } from "./trading-mode";
import { getHealth, markBotTick } from "./trading-api";
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
