import { expect, test } from "vitest";
import { targetCurrencyReason } from "@/lib/orders/target-currency";

test("omitted, null, false, and blank size units pass", () => {
  expect(targetCurrencyReason(undefined)).toBeNull();
  expect(targetCurrencyReason(null, null, null)).toBeNull();
  expect(targetCurrencyReason(false, "", "  ")).toBeNull();
});

test("a present target currency is refused and does not halt", () => {
  expect(targetCurrencyReason("quote_ccy")).toBe(
    "Target currency is not supported; the adapter would size by base amount",
  );
  expect(targetCurrencyReason(0)).toBe(
    "Target currency is not supported; the adapter would size by base amount",
  );
  expect(targetCurrencyReason(undefined, "USDT")).toBe(
    "Size currency is not supported; the adapter would size by base amount",
  );
  expect(targetCurrencyReason(undefined, undefined, "quote")).toBe(
    "Size unit is not supported; the adapter would size by base amount",
  );
});
