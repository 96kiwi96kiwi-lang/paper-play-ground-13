/**
 * Single-worker lease on disk.
 * Two Node processes sharing data/ must not both submit orders.
 * No secrets. Default path is data/worker-lease.json.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { hostname } from "node:os";
import { randomUUID } from "node:crypto";
const PROCESS_IDENTITY = `${hostname()}:${process.pid}:${randomUUID()}`;

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
  return `${process.env.WORKER_ID?.trim() || "worker"}:${PROCESS_IDENTITY}`;
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
    if (
      !ownerId ||
      !Number.isSafeInteger(pid) ||
      pid <= 0 ||
      !Number.isSafeInteger(heldAt) ||
      !Number.isSafeInteger(renewedAt) ||
      heldAt <= 0 ||
      renewedAt < heldAt
    )
      throw new Error("Invalid worker lease");
    return {
      ownerId,
      pid,
      host: typeof raw.host === "string" ? raw.host : "",
      heldAt,
      renewedAt,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
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

export function leaseExpired(
  lease: WorkerLease,
  now = nowMs(),
  ttlMs = defaultLeaseTtlMs(),
): boolean {
  return now - lease.renewedAt > ttlMs;
}

function acquireWorkerLeaseUnlocked(
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

function renewWorkerLeaseUnlocked(
  ownerId: string,
  opts?: { now?: number; ttlMs?: number },
): LeaseResult {
  const current = readLease();
  if (!current) return acquireWorkerLeaseUnlocked(ownerId, opts);
  if (current.ownerId !== ownerId.trim()) {
    if (leaseExpired(current, opts?.now ?? nowMs(), opts?.ttlMs ?? defaultLeaseTtlMs())) {
      return acquireWorkerLeaseUnlocked(ownerId, opts);
    }
    return { ok: false, reason: `Cannot renew: held by ${current.ownerId}`, lease: current };
  }
  const now = opts?.now ?? nowMs();
  const next = { ...current, renewedAt: now };
  writeLease(next);
  return { ok: true, lease: next, stolen: false };
}

function releaseWorkerLeaseUnlocked(ownerId: string): boolean {
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
    return {
      held: false,
      expired: false,
      ageMs: null as number | null,
      lease: null as WorkerLease | null,
      ttlMs,
    };
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

// Serialize each read/check/write across processes sharing one filesystem.
// A lock left by a crashed process remains closed until operator recovery.
function withLeaseLock<T>(work: () => T, blocked: T): T {
  const lockPath = `${workerLeasePath()}.lock`;
  let locked = false;
  try {
    mkdirSync(dirname(lockPath), { recursive: true });
    mkdirSync(lockPath);
    locked = true;
    return work();
  } catch {
    return blocked;
  } finally {
    if (locked) rmdirSync(lockPath);
  }
}
export function acquireWorkerLease(
  ownerId: string,
  opts?: { now?: number; ttlMs?: number; pid?: number; host?: string },
): LeaseResult {
  return withLeaseLock<LeaseResult>(() => acquireWorkerLeaseUnlocked(ownerId, opts), {
    ok: false,
    reason: "Worker lease locked, unreadable or invalid",
    lease: null,
  });
}
export function renewWorkerLease(
  ownerId: string,
  opts?: { now?: number; ttlMs?: number },
): LeaseResult {
  return withLeaseLock<LeaseResult>(() => renewWorkerLeaseUnlocked(ownerId, opts), {
    ok: false,
    reason: "Worker lease locked, unreadable or invalid",
    lease: null,
  });
}
export function releaseWorkerLease(ownerId: string): boolean {
  return withLeaseLock(() => releaseWorkerLeaseUnlocked(ownerId), false);
}
