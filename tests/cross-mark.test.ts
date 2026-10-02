import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { crossMarkReason } from "@/lib/orders/cross-mark";

const block = TRADING_CONFIG.orders.blockCrossMark;

test("a buy limit at or above the mark is refused", () => {
  expect(crossMarkReason("limit", "buy", "BTC/USDT", 100_000, 100_000, block)).toMatch(
    /Cross mark \(BTC\/USDT\): buy limit 100000 is at or above mark 100000/,
  );
  expect(crossMarkReason("limit", "buy", "BTC/USDT", 100_100, 100_000, block)).toMatch(
    /at or above mark/,
  );
});

test("a sell limit at or below the mark is refused", () => {
  expect(crossMarkReason("limit", "sell", "ETH/USDT", 3_500, 3_500, block)).toMatch(
    /Cross mark \(ETH\/USDT\): sell limit 3500 is at or below mark 3500/,
  );
  expect(crossMarkReason("limit", "sell", "ETH/USDT", 3_490, 3_500, block)).toMatch(
    /at or below mark/,
  );
});

test("a resting rung, a market submit, a missing mark, and a disabled floor still pass", () => {
  expect(crossMarkReason("limit", "buy", "SOL/USDT", 148.8, 150, block)).toBeNull();
  expect(crossMarkReason("limit", "sell", "SOL/USDT", 151.2, 150, block)).toBeNull();
  expect(crossMarkReason("market", "buy", "SOL/USDT", 160, 150, block)).toBeNull();
  expect(crossMarkReason("limit", "buy", "SOL/USDT", 160, undefined, block)).toBeNull();
  expect(crossMarkReason("limit", "buy", "SOL/USDT", 160, 150, false)).toBeNull();
});
