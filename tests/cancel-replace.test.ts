import { expect, test } from "vitest";
import { cancelReplaceReason } from "@/lib/orders/cancel-replace";

test("omitted, null, false, and blank cancel-replace fields pass", () => {
  expect(cancelReplaceReason(undefined)).toBeNull();
  expect(cancelReplaceReason(null, null, null)).toBeNull();
  expect(cancelReplaceReason(false, "", "  ")).toBeNull();
});

test("present cancel-replace fields are refused and do not halt", () => {
  expect(cancelReplaceReason(true)).toBe(
    "Cancel-replace is not supported; the adapter would place a new order and leave the old one resting",
  );
  expect(cancelReplaceReason(undefined, "ord-1")).toBe(
    "Cancel order id is not supported; the adapter would place a new order and leave the old one resting",
  );
  expect(cancelReplaceReason(undefined, undefined, 0)).toBe(
    "Order id to cancel is not supported; the adapter would place a new order and leave the old one resting",
  );
});
