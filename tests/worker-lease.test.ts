import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";
import {
  acquireWorkerLease,
  assertWorkerMaySubmit,
  currentWorkerId,
  describeWorkerLease,
  releaseWorkerLease,
  renewWorkerLease,
  setWorkerLeasePathForTests,
} from "@/lib/server/worker-lease";

const dir = mkdtempSync(join(tmpdir(), "ppg-lease-"));
const path = join(dir, "worker-lease.json");
setWorkerLeasePathForTests(path);

afterEach(() => {
  releaseWorkerLease("a");
  releaseWorkerLease("b");
  releaseWorkerLease(currentWorkerId());
});

test("first acquirer wins", () => {
  const a = acquireWorkerLease("worker-a", { now: 1_000, ttlMs: 10_000 });
  expect(a.ok).toBe(true);
  if (a.ok) expect(a.stolen).toBe(false);
  const b = acquireWorkerLease("worker-b", { now: 2_000, ttlMs: 10_000 });
  expect(b.ok).toBe(false);
  expect(b.reason).toMatch(/held by worker-a/);
});

test("expired lease can be stolen", () => {
  acquireWorkerLease("worker-a", { now: 1_000, ttlMs: 5_000 });
  const b = acquireWorkerLease("worker-b", { now: 7_000, ttlMs: 5_000 });
  expect(b.ok).toBe(true);
  if (b.ok) expect(b.stolen).toBe(true);
});

test("owner can renew; stranger cannot", () => {
  acquireWorkerLease("worker-a", { now: 1_000, ttlMs: 10_000 });
  const renewed = renewWorkerLease("worker-a", { now: 4_000, ttlMs: 10_000 });
  expect(renewed.ok).toBe(true);
  const blocked = renewWorkerLease("worker-b", { now: 4_500, ttlMs: 10_000 });
  expect(blocked.ok).toBe(false);
});

test("release lets another worker take over", () => {
  acquireWorkerLease("worker-a", { now: 1_000, ttlMs: 10_000 });
  expect(releaseWorkerLease("worker-a")).toBe(true);
  const b = acquireWorkerLease("worker-b", { now: 1_100, ttlMs: 10_000 });
  expect(b.ok).toBe(true);
});

test("describe reports unheld when empty", () => {
  const snap = describeWorkerLease(1_000, 10_000);
  expect(snap.held).toBe(false);
  expect(snap.lease).toBeNull();
});

test("assertWorkerMaySubmit refuses while another owner holds a live lease", () => {
  acquireWorkerLease("other-replica", { now: Date.now(), ttlMs: 60_000 });
  const gate = assertWorkerMaySubmit({ ttlMs: 60_000 });
  expect(gate.ok).toBe(false);
  expect(gate.reason).toMatch(/Standby worker cannot submit/);
});

test("assertWorkerMaySubmit allows this process when the lease is free", () => {
  const gate = assertWorkerMaySubmit({ ttlMs: 60_000 });
  expect(gate.ok).toBe(true);
  expect(gate.ownerId).toBe(currentWorkerId());
});

// cleanup temp dir after this file
test("cleanup temp lease dir", () => {
  setWorkerLeasePathForTests(null);
  rmSync(dir, { recursive: true, force: true });
  expect(true).toBe(true);
});
