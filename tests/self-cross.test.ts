import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { selfCrossReason } from "@/lib/orders/self-cross";

const block = TRADING_CONFIG.orders.blockOppositeWorking;

test("a buy is refused while a working sell rests on the same symbol", () => {
  const reason = selfCrossReason(
    "buy",
    "BTC/USDT",
    [{ id: "s1", side: "sell", symbol: "BTC/USDT" }],
    block,
  );
  expect(reason).toMatch(/Self-cross \(BTC\/USDT\)/);
  expect(reason).toMatch(/working sell s1/);
});

test("a sell is refused while a working buy rests on the same symbol", () => {
  const reason = selfCrossReason(
    "sell",
    "ETH/USDT",
    [{ id: "b1", side: "buy", symbol: "ETH/USDT" }],
    block,
  );
  expect(reason).toMatch(/Self-cross \(ETH\/USDT\)/);
});

test("same side, other symbols, and a disabled floor still pass", () => {
  const working = [
    { id: "b1", side: "buy", symbol: "SOL/USDT" },
    { id: "s1", side: "sell", symbol: "BNB/USDT" },
  ];
  expect(selfCrossReason("buy", "SOL/USDT", working, block)).toBeNull();
  expect(selfCrossReason("sell", "SOL/USDT", working, block)).toBeNull();
  expect(selfCrossReason("buy", "BTC/USDT", working, false)).toBeNull();
  expect(selfCrossReason("sell", "ETH/USDT", [], block)).toBeNull();
});
