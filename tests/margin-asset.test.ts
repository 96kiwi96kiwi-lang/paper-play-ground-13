import { expect, test } from "vitest";
import { marginAssetReason } from "@/lib/orders/margin-asset";

test("omitted, blank, and false pass", () => {
  expect(marginAssetReason(undefined)).toBeNull();
  expect(marginAssetReason(null, null, null)).toBeNull();
  expect(marginAssetReason("", "  ", false)).toBeNull();
  expect(marginAssetReason(false, false, false)).toBeNull();
});

test("a present margin asset is refused and does not halt", () => {
  expect(marginAssetReason("USDT")).toBe(
    "Margin asset is not supported; the adapter would place a cash spot order",
  );
  expect(marginAssetReason(1)).toBe(
    "Margin asset is not supported; the adapter would place a cash spot order",
  );
  expect(marginAssetReason(undefined, "BTC")).toBe(
    "Margin coin is not supported; the adapter would place a cash spot order",
  );
  expect(marginAssetReason(undefined, undefined, 0)).toBe(
    "Margin currency is not supported; the adapter would place a cash spot order",
  );
});
