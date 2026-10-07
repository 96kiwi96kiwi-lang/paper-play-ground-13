import { expect, test } from "vitest";
import { feeCurrencyReason } from "@/lib/orders/fee-currency";

test("omitted, blank, and false pass", () => {
  expect(feeCurrencyReason(undefined)).toBeNull();
  expect(feeCurrencyReason(null, null, null)).toBeNull();
  expect(feeCurrencyReason("", "  ", false)).toBeNull();
  expect(feeCurrencyReason(false, false, false)).toBeNull();
});

test("a present fee asset is refused and does not halt", () => {
  expect(feeCurrencyReason("BNB")).toBe(
    "Fee currency is not supported; the adapter would charge the default fee asset",
  );
  expect(feeCurrencyReason("KCS")).toBe(
    "Fee currency is not supported; the adapter would charge the default fee asset",
  );
  expect(feeCurrencyReason(undefined, "USDT")).toBe(
    "Fee asset is not supported; the adapter would charge the default fee asset",
  );
  expect(feeCurrencyReason(undefined, undefined, 0)).toBe(
    "Deduct fee is not supported; the adapter would charge the default fee asset",
  );
  expect(feeCurrencyReason(undefined, undefined, true)).toBe(
    "Deduct fee is not supported; the adapter would charge the default fee asset",
  );
});
