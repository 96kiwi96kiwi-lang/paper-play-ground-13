import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import {
  applyHardStops,
  clearHalt,
  evaluateRisk,
  PRICE_GAP_LIMIT,
  recordAcceptedTrade,
  recordLastPrice,
  rollDailyTradeWindow,
  type RiskState,
} from "@/lib/risk";

function baseState(over: Partial<RiskState> = {}): RiskState {
  return {
    portfolioValue: 10_000,
    cash: 8_000,
    openPositionsCount: 0,
    dailyPnlPct: 0,
    drawdownPct: 0,
    losingStreak: 0,
    cooldownUntil: null,
    haltReason: null,
    tradesToday: 0,
    tradesDayKey: "2026-09-29",
    ...over,
  };
}

test("daily loss limit hard-stops and later evaluateRisk refuses", () => {
  const state = baseState({ dailyPnlPct: TRADING_CONFIG.risk.dailyLossLimitPct });
  applyHardStops(state);
  expect(state.haltReason).toMatch(/daily loss/i);
  const decision = evaluateRisk(state, "buy", "BTC/USDT");
  expect(decision.allowed).toBe(false);
  expect(decision.hardStop).toBe(true);
});

test("max drawdown hard-stops", () => {
  const state = baseState({ drawdownPct: TRADING_CONFIG.risk.maxDrawdownPct });
  applyHardStops(state);
  expect(state.haltReason).toMatch(/drawdown/i);
});

test("losing streak hard-stops", () => {
  const state = baseState({ losingStreak: TRADING_CONFIG.risk.losingStreakHardStop });
  applyHardStops(state);
  expect(state.haltReason).toMatch(/losing streak/i);
});

test("clearHalt wipes streak halt but not a still-breached daily loss", () => {
  const streak = baseState({ losingStreak: TRADING_CONFIG.risk.losingStreakHardStop });
  applyHardStops(streak);
  clearHalt(streak);
  expect(streak.haltReason).toBeNull();
  expect(streak.losingStreak).toBe(0);

  const loss = baseState({
    dailyPnlPct: TRADING_CONFIG.risk.dailyLossLimitPct,
    haltReason: "HARD-STOP daily loss limit",
  });
  clearHalt(loss);
  applyHardStops(loss);
  expect(loss.haltReason).toMatch(/daily loss/i);
});

test("daily trade cap refuses without setting haltReason", () => {
  const state = baseState({ tradesToday: TRADING_CONFIG.risk.maxDailyTrades });
  const decision = evaluateRisk(state, "buy", "ETH/USDT");
  expect(decision.allowed).toBe(false);
  expect(decision.code).toBe("daily_trade_cap");
  expect(decision.hardStop).toBeFalsy();
  expect(state.haltReason).toBeNull();
});

test("rollDailyTradeWindow resets the UTC day counter", () => {
  const state = baseState({ tradesToday: 12, tradesDayKey: "1999-01-01" });
  rollDailyTradeWindow(state, Date.parse("2026-09-29T12:00:00Z"));
  expect(state.tradesToday).toBe(0);
  expect(state.tradesDayKey).toBe("2026-09-29");
});

test("recordAcceptedTrade increments within the same UTC day", () => {
  const now = Date.parse("2026-09-29T12:00:00Z");
  const state = baseState({ tradesDayKey: "2026-09-29", tradesToday: 1 });
  recordAcceptedTrade(state, now);
  expect(state.tradesToday).toBe(2);
});

test("first mark is stored and does not gap-halt", () => {
  const state = baseState();
  applyHardStops(state, { symbol: "BTC/USDT", price: 100_000 });
  expect(state.haltReason).toBeNull();
  expect(state.lastPrices?.["BTC/USDT"]).toBe(100_000);
});

test("price-gap hard-stop fires on a jump vs the recorded last mark", () => {
  const state = baseState();
  applyHardStops(state, { symbol: "BTC/USDT", price: 100_000 });
  const jumped = 100_000 * (1 + PRICE_GAP_LIMIT + 0.01);
  applyHardStops(state, { symbol: "BTC/USDT", price: jumped });
  expect(state.haltReason).toMatch(/price gap/i);
  expect(state.lastPrices?.["BTC/USDT"]).toBe(jumped);
});

test("clearHalt after a gap does not instantly re-fire on the same mark", () => {
  const state = baseState();
  recordLastPrice(state, "BTC/USDT", 100_000);
  applyHardStops(state, { symbol: "BTC/USDT", price: 110_000 });
  expect(state.haltReason).toMatch(/price gap/i);
  clearHalt(state);
  applyHardStops(state, { symbol: "BTC/USDT", price: 110_000 });
  expect(state.haltReason).toBeNull();
});
