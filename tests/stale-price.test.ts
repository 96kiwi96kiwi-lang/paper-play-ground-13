import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { PaperExchange } from "@/lib/exchange/paper";
import { OrderManager } from "@/lib/orders/order-manager";
import type { RiskState } from "@/lib/risk";

function riskOk(): RiskState {
  return {
    portfolioValue: 10_000,
    cash: 10_000,
    openPositionsCount: 0,
    dailyPnlPct: 0,
    drawdownPct: 0,
    losingStreak: 0,
    cooldownUntil: null,
    haltReason: null,
  };
}

function manager() {
  const paper = new PaperExchange(10_000);
  paper.setTickers({
    "BTC/USDT": {
      symbol: "BTC/USDT",
      last: 50_000,
      bid: 49_990,
      ask: 50_010,
      timestamp: Date.now(),
    },
  });
  return new OrderManager(paper, 10_000);
}

test("market submit without quotedAt is refused", async () => {
  const result = await manager().submit(
    { symbol: "BTC/USDT", side: "buy", amount: 0.01, type: "market", price: 50_000 },
    riskOk(),
  );
  expect(result.ok).toBe(false);
  expect(result.reason).toMatch(/quotedAt/i);
});

test("market submit with stale quotedAt is refused", async () => {
  const result = await manager().submit(
    {
      symbol: "BTC/USDT",
      side: "buy",
      amount: 0.01,
      type: "market",
      price: 50_000,
      quotedAt: Date.now() - TRADING_CONFIG.orders.maxPriceAgeMs - 1_000,
    },
    riskOk(),
  );
  expect(result.ok).toBe(false);
  expect(result.reason).toMatch(/Stale price/i);
});

test("market submit with fresh quotedAt is accepted", async () => {
  const result = await manager().submit(
    {
      symbol: "BTC/USDT",
      side: "buy",
      amount: 0.01,
      type: "market",
      price: 50_000,
      quotedAt: Date.now(),
    },
    riskOk(),
  );
  expect(result.ok).toBe(true);
});
