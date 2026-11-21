import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { normalizePairSymbol } from "@/lib/orders/symbol-form";
import { fmtDuration, fmtPct, fmtUSD } from "@/lib/trading";

/**
 * The planner named src/utils/format.ts. That module is not in this repo.
 * These tests lock the string shaper and the display formatters that exist.
 * Production code is unchanged.
 */

const allowed = new Set<string>(TRADING_CONFIG.pairs);

test("an empty string is refused and does not become a pair", () => {
  expect(normalizePairSymbol("", allowed)).toEqual({ reason: "Unsupported pair: " });
});

test("whitespace-only input is refused and does not become a pair", () => {
  const blank = " \t\n ";
  expect(normalizePairSymbol(blank, allowed)).toEqual({ reason: `Unsupported pair: ${blank}` });
});

test("a normal allowlisted pair is unchanged", () => {
  expect(normalizePairSymbol("BTC/USDT", allowed)).toEqual({ symbol: "BTC/USDT" });
  expect(normalizePairSymbol("ETH/USDT", allowed)).toEqual({ symbol: "ETH/USDT" });
});

test("mixed case, spaces, and a hyphen normalize onto the allowlist", () => {
  expect(normalizePairSymbol("  EtH-usdt  ", allowed)).toEqual({ symbol: "ETH/USDT" });
  expect(normalizePairSymbol("bTc / UsDt", allowed)).toEqual({ symbol: "BTC/USDT" });
});

test("fmtUSD formats paper amounts in USD", () => {
  expect(fmtUSD(0)).toBe("$0.00");
  expect(fmtUSD(1234.5)).toBe("$1,234.50");
  expect(fmtUSD(-2)).toBe("-$2.00");
});

test("fmtPct formats signed percentages", () => {
  expect(fmtPct(1.5)).toBe("+1.50%");
  expect(fmtPct(0)).toBe("0.00%");
  expect(fmtPct(-4)).toBe("-4.00%");
});

test("fmtDuration formats zero, seconds, minutes, and hours", () => {
  expect(fmtDuration(0)).toBe("0s");
  expect(fmtDuration(-10)).toBe("0s");
  expect(fmtDuration(5_000)).toBe("5s");
  expect(fmtDuration(90_000)).toBe("1m 30s");
  expect(fmtDuration(3_661_000)).toBe("1h 1m 1s");
});
