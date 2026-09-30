import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import {
  describePaperLoop,
  paperServerLoopRequested,
  runPaperHousekeepingTick,
  startPaperServerLoop,
  stopPaperServerLoop,
} from "@/lib/server/paper-loop";
import { getBotHeartbeat } from "@/lib/server/heartbeat";
import { setWorkerLeasePathForTests } from "@/lib/server/worker-lease";

let dir: string;
const prevCwd = process.cwd();
const prevLoop = process.env.PAPER_SERVER_LOOP;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ppg-loop-"));
  process.chdir(dir);
  setWorkerLeasePathForTests(join(dir, "worker-lease.json"));
  delete process.env.PAPER_SERVER_LOOP;
  stopPaperServerLoop("reset");
});

afterEach(() => {
  stopPaperServerLoop("reset");
  setWorkerLeasePathForTests(null);
  process.chdir(prevCwd);
  if (prevLoop == null) delete process.env.PAPER_SERVER_LOOP;
  else process.env.PAPER_SERVER_LOOP = prevLoop;
  rmSync(dir, { recursive: true, force: true });
});

test("loop is off unless PAPER_SERVER_LOOP is set", () => {
  expect(paperServerLoopRequested()).toBe(false);
  const status = startPaperServerLoop();
  expect(status.running).toBe(false);
  expect(status.reason).toMatch(/disabled/);
});

test("housekeeping tick records a heartbeat without submitting", () => {
  const now = 1_700_000_000_000;
  const status = runPaperHousekeepingTick(now);
  expect(status.ticks).toBeGreaterThan(0);
  expect(status.lastTickAt).toBe(now);
  const beat = getBotHeartbeat();
  expect(beat?.at).toBe(now);
  expect(beat?.action).toBe("hold");
});

test("start refuses to run when env is on but process stays paper-gated", () => {
  process.env.PAPER_SERVER_LOOP = "1";
  expect(paperServerLoopRequested()).toBe(true);
  const status = startPaperServerLoop();
  expect(status.mode).toBe("paper");
  expect(status.enabled).toBe(true);
  stopPaperServerLoop();
  expect(describePaperLoop().running).toBe(false);
});
