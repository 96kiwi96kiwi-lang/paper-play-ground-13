import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { consecutiveBuysReason, trailingAcceptedBuys } from "@/lib/orders/consecutive-buys";

const cap = TRADING_CONFIG.orders.maxConsecutiveBuysPerSymbol;

function row(
  side: "buy" | "sell",
  status: string,
  timestamp: number,
  symbol = "BTC/USDT",
) {
  return { side, status, timestamp, symbol };
}

test("sells and other symbols do not count", () => {
  const orders = [
    row("buy", "closed", 1),
    row("buy", "closed", 2, "ETH/USDT"),
    row("sell", "closed", 3),
    row("buy", "rejected", 4),
    row("buy", "canceled", 5),
  ];
  expect(trailingAcceptedBuys(orders, "BTC/USDT")).toBe(0);
});

test("streak resets after an accepted sell", () => {
  const orders = [
    row("buy", "closed", 1),
    row("buy", "closed", 2),
    row("sell", "closed", 3),
    row("buy", "open", 4),
  ];
  expect(trailingAcceptedBuys(orders, "BTC/USDT")).toBe(1);
  expect(consecutiveBuysReason("buy", "BTC/USDT", 1, cap)).toBeNull();
});

test("cap blocks another buy and still allows a sell", () => {
  const orders = [1, 2, 3, 4].map((t) => row("buy", "closed", t));
  const streak = trailingAcceptedBuys(orders, "BTC/USDT");
  expect(streak).toBe(4);
  expect(consecutiveBuysReason("buy", "BTC/USDT", streak, cap)).toMatch(/Consecutive buys/);
  expect(consecutiveBuysReason("sell", "BTC/USDT", streak, cap)).toBeNull();
});

test("default cap sits above the grid stack", () => {
  expect(cap).toBeGreaterThan(TRADING_CONFIG.grid.maxStackedBuys);
});
