import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import {
  describePaperLoop,
  paperServerLoopRequested,
  runPaperHousekeepingTick,
  runPaperMarketTick,
  resetPaperMarketRuntimeForTests,
  setPaperQuoteSourceForTests,
  startPaperServerLoop,
  stopPaperServerLoop,
} from "@/lib/server/paper-loop";
import { getBotHeartbeat } from "@/lib/server/heartbeat";
import {
  loadMarketHistory,
  loadPaperPortfolio,
  loadSeenOrders,
  persistMarketHistory,
  persistSeenOrders,
  setBotStatePathForTests,
} from "@/lib/server/persist";
import { acquireWorkerLease, setWorkerLeasePathForTests } from "@/lib/server/worker-lease";
import type { UnifiedOrder } from "@/lib/exchange/types";

let dir: string;
const prevCwd = process.cwd();
const prevLoop = process.env.PAPER_SERVER_LOOP;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(1_700_000_300_000);
  dir = mkdtempSync(join(tmpdir(), "ppg-loop-"));
  process.chdir(dir);
  setWorkerLeasePathForTests(join(dir, "worker-lease.json"));
  setBotStatePathForTests(join(dir, "bot-state.json"));
  delete process.env.PAPER_SERVER_LOOP;
  stopPaperServerLoop("reset");
  resetPaperMarketRuntimeForTests();
});

afterEach(() => {
  stopPaperServerLoop("reset");
  setPaperQuoteSourceForTests(null);
  resetPaperMarketRuntimeForTests();
  setWorkerLeasePathForTests(null);
  setBotStatePathForTests(null);
  process.chdir(prevCwd);
  if (prevLoop == null) delete process.env.PAPER_SERVER_LOOP;
  else process.env.PAPER_SERVER_LOOP = prevLoop;
  rmSync(dir, { recursive: true, force: true });
  vi.useRealTimers();
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

test("housekeeping cancels stale persisted working limits without live calls", () => {
  const now = 1_700_000_000_000;
  const stale: UnifiedOrder = {
    id: "stale-limit",
    symbol: "BTC/USDT",
    side: "buy",
    type: "limit",
    amount: 0.01,
    price: 50_000,
    status: "open",
    filled: 0,
    remaining: 0.01,
    cost: 0,
    timestamp: now - TRADING_CONFIG.orders.staleOpenOrderMs - 1,
  };
  persistSeenOrders([stale]);
  const status = runPaperHousekeepingTick(now);
  expect(status.lastStaleCanceled).toBe(1);
  expect(status.reason).toMatch(/canceled 1 stale/);
  expect(loadSeenOrders()[0]?.status).toBe("canceled");
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

test("market tick uses a fresh quote, strategy, lease and persisted paper order", async () => {
  const now = 1_700_000_300_000;
  persistMarketHistory({ "BTC/USDT": [{ t: now - 5 * 60_000, price: 100 }] });
  resetPaperMarketRuntimeForTests();
  setPaperQuoteSourceForTests(async () => ({
    fetchedAt: now,
    tickers: {
      "BTC/USDT": {
        symbol: "BTC/USDT",
        last: 103,
        bid: 103,
        ask: 103,
        timestamp: now,
      },
    },
  }));

  const status = await runPaperMarketTick(now);

  expect(status.reason).toMatch(/market tick: 1 decision/);
  expect(status.lastOrders).toBe(1);
  expect(status.lastQuoteAt).toBe(now);
  expect(loadSeenOrders()).toHaveLength(1);
  expect(loadSeenOrders()[0]?.symbol).toBe("BTC/USDT");
  expect(loadSeenOrders()[0]?.cost).toBeLessThanOrEqual(
    TRADING_CONFIG.orders.maxHourlyBuyNotionalPerSymbolUsd,
  );
  expect(loadPaperPortfolio()?.positions["BTC/USDT"]?.amount).toBeGreaterThan(0);
  expect(loadMarketHistory()["BTC/USDT"]).toHaveLength(2);
});

test("market runtime restores paper inventory after a process restart", async () => {
  const now = 1_700_000_300_000;
  persistMarketHistory({ "BTC/USDT": [{ t: now - 5 * 60_000, price: 100 }] });
  resetPaperMarketRuntimeForTests();
  setPaperQuoteSourceForTests(async (at = now) => ({
    fetchedAt: at,
    tickers: {
      "BTC/USDT": { symbol: "BTC/USDT", last: 103, bid: 103, ask: 103, timestamp: at },
    },
  }));
  await runPaperMarketTick(now);
  const held = loadPaperPortfolio()?.positions["BTC/USDT"]?.amount ?? 0;
  expect(held).toBeGreaterThan(0);

  resetPaperMarketRuntimeForTests();
  vi.setSystemTime(now + 45_000);
  const status = await runPaperMarketTick(now + 45_000);

  expect(status.lastOrders).toBe(0);
  expect(loadPaperPortfolio()?.positions["BTC/USDT"]?.amount).toBe(held);
  expect(loadSeenOrders()).toHaveLength(1);
});


test("standby startup resumes after the previous deployment lease expires", async () => {
  process.env.PAPER_SERVER_LOOP = "1";
  expect(acquireWorkerLease("previous-deployment").ok).toBe(true);
  const quotes = vi.fn(async () => ({ fetchedAt: Date.now(), tickers: {} }));
  setPaperQuoteSourceForTests(quotes);
  const first = startPaperServerLoop();
  expect(first.reason).toMatch(/standby/);
  expect(first.running).toBe(true);
  startPaperServerLoop();
  expect(vi.getTimerCount()).toBe(1);
  await vi.advanceTimersByTimeAsync(45_000);
  expect(quotes).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(90_000);
  expect(quotes).toHaveBeenCalledTimes(1);
  stopPaperServerLoop();
  await vi.advanceTimersByTimeAsync(180_000);
  expect(quotes).toHaveBeenCalledTimes(1);
});
