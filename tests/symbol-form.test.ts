import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { normalizePairSymbol } from "@/lib/orders/symbol-form";

const allowed = new Set<string>(TRADING_CONFIG.pairs);

test("slash, hyphen, and mixed case map onto the allowlist", () => {
  expect(normalizePairSymbol("BTC/USDT", allowed)).toEqual({ symbol: "BTC/USDT" });
  expect(normalizePairSymbol("eth-usdt", allowed)).toEqual({ symbol: "ETH/USDT" });
  expect(normalizePairSymbol("  sol/usdt  ", allowed)).toEqual({ symbol: "SOL/USDT" });
});

test("an unknown pair is refused and does not halt", () => {
  const reason = normalizePairSymbol("DOGE-USDT", allowed);
  expect(reason).toEqual({ reason: "Unsupported pair: DOGE/USDT" });
  expect("reason" in reason && reason.reason).toMatch(/Unsupported pair/);
});

test("blank input is refused", () => {
  const reason = normalizePairSymbol("   ", allowed);
  expect("reason" in reason).toBe(true);
  if ("reason" in reason) expect(reason.reason).toMatch(/^Unsupported pair:/);
});
