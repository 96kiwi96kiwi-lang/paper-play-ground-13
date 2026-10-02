import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { rungSpacingReason } from "@/lib/orders/rung-spacing";

const block = TRADING_CONFIG.orders.blockTightRung;
const spacing = TRADING_CONFIG.orders.minRungSpacingPct;

test("min rung spacing matches the grid and sits above the same-price band", () => {
  expect(spacing).toBe(TRADING_CONFIG.grid.spacingPct);
  expect(spacing).toBeGreaterThan(TRADING_CONFIG.orders.samePriceBandPct);
});

test("a same-side limit tighter than one rung is refused", () => {
  const working = [{ id: "b1", side: "buy", symbol: "BTC/USDT", price: 100_000 }];
  expect(
    rungSpacingReason("buy", "BTC/USDT", 100_400, working, spacing, block),
  ).toMatch(/Tight rung \(BTC\/USDT\): working buy b1 at 100000 is 0\.40% from 100400/);
});

test("an adjacent rung, other side, other symbol, market, and a disabled floor still pass", () => {
  const working = [{ id: "b1", side: "buy", symbol: "BTC/USDT", price: 100 }];
  expect(rungSpacingReason("buy", "BTC/USDT", 100.8, working, spacing, block)).toBeNull();
  expect(rungSpacingReason("sell", "BTC/USDT", 100.4, working, spacing, block)).toBeNull();
  expect(rungSpacingReason("buy", "ETH/USDT", 100.4, working, spacing, block)).toBeNull();
  expect(rungSpacingReason("buy", "BTC/USDT", undefined, working, spacing, block)).toBeNull();
  expect(rungSpacingReason("buy", "BTC/USDT", 100.4, working, spacing, false)).toBeNull();
  expect(
    rungSpacingReason("buy", "BTC/USDT", 100.4, [{ side: "buy", symbol: "BTC/USDT" }], spacing, block),
  ).toBeNull();
});
