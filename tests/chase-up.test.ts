import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { chaseUpReason, lastAcceptedBuyFill } from "@/lib/orders/chase-up";

const maxPct = TRADING_CONFIG.orders.maxChaseUpPct;
const windowMs = TRADING_CONFIG.orders.chaseUpWindowMs;
const now = 1_700_000_000_000;

function row(
  side: "buy" | "sell",
  status: string,
  timestamp: number,
  price: number,
  symbol = "BTC/USDT",
) {
  return { side, status, timestamp, price, symbol };
}

test("latest accepted buy fill ignores rejects, cancels, and other symbols", () => {
  const orders = [
    row("buy", "closed", now - 5_000, 100),
    row("buy", "rejected", now - 1_000, 140),
    row("buy", "canceled", now - 500, 150),
    row("buy", "closed", now - 200, 110, "ETH/USDT"),
    row("sell", "closed", now - 100, 130),
  ];
  expect(lastAcceptedBuyFill(orders, "BTC/USDT")).toEqual({ price: 100, timestamp: now - 5_000 });
});

test("a buy at least maxPct above a fresh fill is refused", () => {
  const last = { price: 100, timestamp: now - 60_000 };
  const mark = 100 * (1 + maxPct / 100);
  const reason = chaseUpReason("buy", "BTC/USDT", mark, last, now, windowMs, maxPct);
  expect(reason).toMatch(/Chase up \(BTC\/USDT\)/);
});

test("a shallow lift, an old fill, a missing mark, and a sell still pass", () => {
  const fresh = { price: 100, timestamp: now - 60_000 };
  const stale = { price: 100, timestamp: now - windowMs - 1 };
  expect(chaseUpReason("buy", "ETH/USDT", 101, fresh, now, windowMs, maxPct)).toBeNull();
  expect(chaseUpReason("buy", "ETH/USDT", 130, stale, now, windowMs, maxPct)).toBeNull();
  expect(chaseUpReason("buy", "ETH/USDT", undefined, fresh, now, windowMs, maxPct)).toBeNull();
  expect(chaseUpReason("sell", "SOL/USDT", 130, fresh, now, windowMs, maxPct)).toBeNull();
});
