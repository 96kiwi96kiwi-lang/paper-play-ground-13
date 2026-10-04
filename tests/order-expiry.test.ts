import { expect, test } from "vitest";
import { orderExpiryReason } from "@/lib/orders/order-expiry";

test("omitted, null, and blank expiry fields pass", () => {
  expect(orderExpiryReason(undefined)).toBeNull();
  expect(orderExpiryReason(null, null, null)).toBeNull();
  expect(orderExpiryReason("", "  ", "")).toBeNull();
});

test("present expiry fields are refused and do not halt", () => {
  expect(orderExpiryReason(30)).toBe(
    "Cancel after is not supported; the adapter would rest the order",
  );
  expect(orderExpiryReason(undefined, 1_700_000_000_000)).toBe(
    "Expire time is not supported; the adapter would rest the order",
  );
  expect(orderExpiryReason(undefined, undefined, "2026-10-04T12:00:00Z")).toBe(
    "Good till date is not supported; the adapter would rest the order",
  );
  expect(orderExpiryReason(0)).toBe(
    "Cancel after is not supported; the adapter would rest the order",
  );
});
