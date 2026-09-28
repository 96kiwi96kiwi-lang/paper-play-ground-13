/**
 * Last refused submit. Separate from bot-state so persist.ts stays small.
 * No secrets. Not a hard-stop.
 */

import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export type PersistedLastReject = {
  at: number;
  reason: string;
  symbol?: string;
  side?: string;
};

const REJECT_PATH = resolve(process.cwd(), "data", "last-reject.json");
const REJECT_TMP = `${REJECT_PATH}.tmp`;

export function sanitizeLastReject(raw: unknown): PersistedLastReject | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as PersistedLastReject;
  const at = Number(r.at);
  if (!Number.isFinite(at) || at <= 0) return null;
  if (typeof r.reason !== "string" || !r.reason.trim()) return null;
  const reason = r.reason.trim().slice(0, 280);
  const symbol = typeof r.symbol === "string" && r.symbol.trim() ? r.symbol.trim().slice(0, 32) : undefined;
  const side = r.side === "buy" || r.side === "sell" ? r.side : undefined;
  return { at, reason, symbol, side };
}

export function persistLastReject(reject: PersistedLastReject | null): void {
  const clean = sanitizeLastReject(reject);
  mkdirSync(dirname(REJECT_PATH), { recursive: true });
  if (!clean) {
    try {
      if (existsSync(REJECT_PATH)) unlinkSync(REJECT_PATH);
    } catch {
      /* ignore */
    }
    return;
  }
  writeFileSync(REJECT_TMP, JSON.stringify(clean, null, 2), "utf8");
  try {
    renameSync(REJECT_TMP, REJECT_PATH);
  } catch (err) {
    try {
      unlinkSync(REJECT_TMP);
    } catch {
      /* ignore */
    }
    console.error("[last-reject] failed to write", err);
  }
}

export function loadLastReject(): PersistedLastReject | null {
  try {
    if (!existsSync(REJECT_PATH)) return null;
    return sanitizeLastReject(JSON.parse(readFileSync(REJECT_PATH, "utf8")));
  } catch (err) {
    console.warn("[last-reject] failed to load", err);
    return null;
  }
}
