/**
 * Single-worker lease on disk.
 * Two Node processes sharing data/ must not both submit orders.
 * No secrets. Default path is data/worker-lease.json.
 */

import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { hostname } from "node:os";

export type WorkerLease = {
  ownerId: string;
  pid: number;
  host: string;
  heldAt: number;
  renewedAt: number;
};

export type LeaseResult =
  | { ok: true; lease: WorkerLease; stolen: boolean }
  | { ok: false; reason: string; lease: WorkerLease | null };

const DEFAULT_TTL_MS = 90_000;
let overridePath: string | null = null;

export function workerLeasePath(): string {
  if (overridePath) return overridePath;
  const fromEnv = process.env.WORKER_LEASE_PATH?.trim();
  if (fromEnv) return resolve(fromEnv);
  return resolve(process.cwd(), "data", "worker-lease.json");
}

/** Test-only: point the lease file at a temp path. */
export function setWorkerLeasePathForTests(path: string | null): void {
  overridePath = path;
}

export function defaultLeaseTtlMs(): number {
  const raw = Number(process.env.WORKER_LEASE_TTL_MS);
  return Number.isFinite(raw) && raw >= 5_000 ? raw : DEFAULT_TTL_MS;
}

export function currentWorkerId(): string {
  return process.env.WORKER_ID?.trim() || `pid-${process.pid}`;
}

function nowMs(): number {
  return Date.now();
}

function readLease(): WorkerLease | null {
  const path = workerLeasePath();
  try {
    if (!existsSync(path)) return null;
    const raw = JSON.parse(readFileSync(path, "utf8")) as Partial<WorkerLease>;
    const ownerId = typeof raw.ownerId === "string" ? raw.ownerId.trim() : "";
    const pid = Number(raw.pid);
    const heldAt = Number(raw.heldAt);
    const renewedAt = Number(raw.renewedAt);
    if (!ownerId || !Number.isFinite(pid) || heldAt <= 0 || renewedAt <= 0) return null;
    return {
      ownerId,
      pid,
      host: typeof raw.host === "string" ? raw.host : "",
      heldAt,
      renewedAt,
    };
  } catch {
    return null;
  }
}

function writeLease(lease: WorkerLease): void {
  const path = workerLeasePath();
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(lease, null, 2), "utf8");
  try {
    renameSync(tmp, path);
  } catch (err) {
    try {
      unlinkSync(tmp);
    } catch {
      /* ignore */
    }
    throw err;
  }
}

export function leaseExpired(lease: WorkerLease, now = nowMs(), ttlMs = defaultLeaseTtlMs()): boolean {
  return now - lease.renewedAt > ttlMs;
}

export function acquireWorkerLease(
  ownerId: string,
  opts?: { now?: number; ttlMs?: number; pid?: number; host?: string },
): LeaseResult {
  const id = ownerId.trim();
  if (!id) return { ok: false, reason: "ownerId required", lease: null };
  const now = opts?.now ?? nowMs();
  const ttlMs = opts?.ttlMs ?? defaultLeaseTtlMs();
  const current = readLease();
  if (current && current.ownerId !== id && !leaseExpired(current, now, ttlMs)) {
    return {
      ok: false,
      reason: `Lease held by ${current.ownerId} pid=${current.pid} until ${current.renewedAt + ttlMs}`,
      lease: current,
    };
  }
  const stolen = Boolean(current && current.ownerId !== id);
  const lease: WorkerLease = {
    ownerId: id,
    pid: opts?.pid ?? process.pid,
    host: opts?.host ?? hostname(),
    heldAt: current && current.ownerId === id ? current.heldAt : now,
    renewedAt: now,
  };
  writeLease(lease);
  return { ok: true, lease, stolen };
}

export function renewWorkerLease(
  ownerId: string,
  opts?: { now?: number; ttlMs?: number },
): LeaseResult {
  const current = readLease();
  if (!current) return acquireWorkerLease(ownerId, opts);
  if (current.ownerId !== ownerId.trim()) {
    if (leaseExpired(current, opts?.now ?? nowMs(), opts?.ttlMs ?? defaultLeaseTtlMs())) {
      return acquireWorkerLease(ownerId, opts);
    }
    return { ok: false, reason: `Cannot renew: held by ${current.ownerId}`, lease: current };
  }
  const now = opts?.now ?? nowMs();
  const next = { ...current, renewedAt: now };
  writeLease(next);
  return { ok: true, lease: next, stolen: false };
}

export function releaseWorkerLease(ownerId: string): boolean {
  const current = readLease();
  if (!current) return true;
  if (current.ownerId !== ownerId.trim()) return false;
  try {
    unlinkSync(workerLeasePath());
  } catch {
    /* already gone */
  }
  return true;
}

export function describeWorkerLease(now = nowMs(), ttlMs = defaultLeaseTtlMs()) {
  const lease = readLease();
  if (!lease) {
    return { held: false, expired: false, ageMs: null as number | null, lease: null as WorkerLease | null, ttlMs };
  }
  const expired = leaseExpired(lease, now, ttlMs);
  return {
    held: !expired,
    expired,
    ageMs: Math.max(0, now - lease.renewedAt),
    lease,
    ttlMs,
  };
}

/**
 * Renew (or steal expired) as this process. Refuse if another live owner holds it.
 * Used as the last gate before OrderManager talks to an adapter.
 */
export function assertWorkerMaySubmit(opts?: { now?: number; ttlMs?: number }): {
  ok: boolean;
  reason?: string;
  ownerId: string;
} {
  const ownerId = currentWorkerId();
  const result = renewWorkerLease(ownerId, opts);
  if (!result.ok) {
    return { ok: false, ownerId, reason: `Standby worker cannot submit: ${result.reason}` };
  }
  return { ok: true, ownerId };
}
