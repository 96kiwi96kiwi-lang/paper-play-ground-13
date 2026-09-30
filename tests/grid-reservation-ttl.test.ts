import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import {
  expireStaleGridReservations,
  getGridBook,
  hydrateGridBooks,
  resetGridBooks,
} from "@/lib/strategies";

test("stale unconfirmed reservations roll back stack and last-fill", () => {
  resetGridBooks();
  const now = Date.now();
  hydrateGridBooks({
    "BTC/USDT": {
      mid: 50_000,
      spacingPct: 0.8,
      builtAt: now - TRADING_CONFIG.grid.reservationTtlMs * 2,
      lastSide: "buy",
      lastLevel: -2,
      lastFillPrice: 49_200,
      lastFillAt: now - TRADING_CONFIG.grid.reservationTtlMs - 1_000,
      stackedBuys: 2,
      reserved: true,
    },
  });

  const n = expireStaleGridReservations(now);
  expect(n).toBe(1);
  const book = getGridBook("BTC/USDT");
  expect(book?.reserved).toBe(false);
  expect(book?.stackedBuys).toBe(1);
  expect(book?.lastSide).toBeUndefined();
  expect(book?.lastFillAt).toBeUndefined();
});

test("confirmed fills are not expired", () => {
  resetGridBooks();
  const now = Date.now();
  hydrateGridBooks({
    "ETH/USDT": {
      mid: 4_000,
      spacingPct: 0.8,
      builtAt: now - TRADING_CONFIG.grid.reservationTtlMs * 3,
      lastSide: "buy",
      lastLevel: -1,
      lastFillPrice: 3_968,
      lastFillAt: now - TRADING_CONFIG.grid.reservationTtlMs * 2,
      stackedBuys: 1,
      reserved: false,
    },
  });

  const n = expireStaleGridReservations(now);
  expect(n).toBe(0);
  const book = getGridBook("ETH/USDT");
  expect(book?.stackedBuys).toBe(1);
  expect(book?.lastSide).toBe("buy");
  expect(book?.reserved).toBe(false);
});
