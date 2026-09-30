import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import {
  workerLeasePath,
  acquireWorkerLease,
  assertWorkerMaySubmit,
  currentWorkerId,
  describeWorkerLease,
  releaseWorkerLease,
  renewWorkerLease,
  setWorkerLeasePathForTests,
} from "@/lib/server/worker-lease";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ppg-lease-"));
  setWorkerLeasePathForTests(join(dir, "worker-lease.json"));
});
afterEach(() => {
  setWorkerLeasePathForTests(null);
  rmSync(dir, { recursive: true, force: true });
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

test("a held filesystem lock blocks acquisition and renewal", () => {
  mkdirSync(`${workerLeasePath()}.lock`);
  expect(acquireWorkerLease("worker-a").ok).toBe(false);
  expect(renewWorkerLease("worker-a").ok).toBe(false);
});
test("malformed stored lease cannot be replaced with a new owner", () => {
  writeFileSync(workerLeasePath(), "not-json");
  expect(acquireWorkerLease("worker-a").ok).toBe(false);
});
test("invalid numeric lease fields fail closed", () => {
  writeFileSync(
    workerLeasePath(),
    JSON.stringify({ ownerId: "other", pid: 10, heldAt: "NaN", renewedAt: "NaN" }),
  );
  expect(acquireWorkerLease("worker-a").ok).toBe(false);
});

test("separate processes sharing a lease have exactly one winner", async () => {
  const path = workerLeasePath();
  const moduleUrl = new URL("../src/lib/server/worker-lease.ts", import.meta.url).href;
  const run = () =>
    new Promise<boolean>((resolve, reject) => {
      const code = `import { acquireWorkerLease, currentWorkerId } from ${JSON.stringify(moduleUrl)}; console.log(JSON.stringify(acquireWorkerLease(currentWorkerId()).ok));`;
      const child = spawn(
        process.execPath,
        ["--experimental-strip-types", "--input-type=module", "-e", code],
        {
          env: { ...process.env, WORKER_LEASE_PATH: path, WORKER_ID: "same-label" },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      let output = "";
      let errors = "";
      child.stdout.on("data", (chunk) => (output += chunk));
      child.stderr.on("data", (chunk) => (errors += chunk));
      child.on("error", reject);
      child.on("close", (code) => {
        if (code !== 0) reject(new Error(errors));
        else resolve(JSON.parse(output.trim()));
      });
    });
  const winners = await Promise.all([run(), run(), run(), run()]);
  expect(winners.filter(Boolean)).toHaveLength(1);
});
