import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { samePriceWorkingReason } from "@/lib/orders/same-price";

const block = TRADING_CONFIG.orders.blockSamePriceWorking;
const band = TRADING_CONFIG.orders.samePriceBandPct;

test("a limit buy is refused when a working buy already rests inside the band", () => {
  const reason = samePriceWorkingReason(
    "buy",
    "BTC/USDT",
    100_100,
    [{ id: "b1", side: "buy", symbol: "BTC/USDT", price: 100_000 }],
    band,
    block,
  );
  expect(reason).toMatch(/Same price \(BTC\/USDT\)/);
  expect(reason).toMatch(/working buy b1/);
  expect(reason).toMatch(/100000/);
});

test("a limit sell is refused when a working sell already rests at the same price", () => {
  const reason = samePriceWorkingReason(
    "sell",
    "ETH/USDT",
    3_500,
    [{ id: "s1", side: "sell", symbol: "ETH/USDT", price: 3_500 }],
    band,
    block,
  );
  expect(reason).toMatch(/Same price \(ETH\/USDT\)/);
  expect(reason).toMatch(/working sell s1/);
});

test("an adjacent rung, other side, other symbol, and a disabled floor still pass", () => {
  const working = [
    { id: "b1", side: "buy", symbol: "SOL/USDT", price: 150 },
    { id: "s1", side: "sell", symbol: "SOL/USDT", price: 150 },
  ];
  expect(samePriceWorkingReason("buy", "SOL/USDT", 148.8, working, band, block)).toBeNull();
  expect(samePriceWorkingReason("buy", "SOL/USDT", 150, working, band, block)).toMatch(/Same price/);
  expect(samePriceWorkingReason("sell", "BTC/USDT", 150, working, band, block)).toBeNull();
  expect(samePriceWorkingReason("buy", "SOL/USDT", 150, working, band, false)).toBeNull();
  expect(samePriceWorkingReason("buy", "SOL/USDT", undefined, working, band, block)).toBeNull();
});
