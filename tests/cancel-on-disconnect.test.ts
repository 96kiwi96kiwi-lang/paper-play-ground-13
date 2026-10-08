import { expect, test } from "vitest";
import { cancelOnDisconnectReason } from "@/lib/orders/cancel-on-disconnect";

test("omitted, blank, and false pass", () => {
  expect(cancelOnDisconnectReason(undefined)).toBeNull();
  expect(cancelOnDisconnectReason(null, null, null)).toBeNull();
  expect(cancelOnDisconnectReason("", "  ", false)).toBeNull();
  expect(cancelOnDisconnectReason(false, false, false)).toBeNull();
});

test("a present dead-man flag is refused and does not halt", () => {
  expect(cancelOnDisconnectReason(true)).toBe(
    "Cancel on disconnect is not supported; the adapter would leave a resting order",
  );
  expect(cancelOnDisconnectReason("arm")).toBe(
    "Cancel on disconnect is not supported; the adapter would leave a resting order",
  );
  expect(cancelOnDisconnectReason(undefined, "on")).toBe(
    "Dead-man switch is not supported; the adapter would leave a resting order",
  );
  expect(cancelOnDisconnectReason(undefined, undefined, "1")).toBe(
    "COD flag is not supported; the adapter would leave a resting order",
  );
  expect(cancelOnDisconnectReason(undefined, undefined, 0)).toBe(
    "COD flag is not supported; the adapter would leave a resting order",
  );
});
