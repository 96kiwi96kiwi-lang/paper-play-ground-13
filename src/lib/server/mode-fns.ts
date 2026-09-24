/**
 * Client-callable server functions for mode.
 * Responses never include API keys or secrets.
 */

import { createServerFn } from "@tanstack/react-start";
import { getModeStatus, setRuntimeMode, type ModeStatus } from "./trading-mode";
import { getHealth } from "./trading-api";

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
  };
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
