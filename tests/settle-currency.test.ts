import { expect, test } from "vitest";
import { settleCurrencyReason } from "@/lib/orders/settle-currency";

test("omitted, blank, and false pass", () => {
  expect(settleCurrencyReason(undefined)).toBeNull();
  expect(settleCurrencyReason(null, null, null)).toBeNull();
  expect(settleCurrencyReason("", "  ", false)).toBeNull();
  expect(settleCurrencyReason(false, false, false)).toBeNull();
});

test("a present settle currency is refused and does not halt", () => {
  expect(settleCurrencyReason("USDT")).toBe(
    "Settle currency is not supported; the adapter places the base size on the spot book",
  );
  expect(settleCurrencyReason(0)).toBe(
    "Settle currency is not supported; the adapter places the base size on the spot book",
  );
  expect(settleCurrencyReason(undefined, "USDC")).toBe(
    "Settle coin is not supported; the adapter places the base size on the spot book",
  );
  expect(settleCurrencyReason(undefined, undefined, "BTC")).toBe(
    "Quote coin is not supported; the adapter places the base size on the spot book",
  );
  expect(settleCurrencyReason(undefined, undefined, true)).toBe(
    "Quote coin is not supported; the adapter places the base size on the spot book",
  );
});
