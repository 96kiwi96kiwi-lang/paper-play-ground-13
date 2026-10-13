import { expect, test } from "vitest";
import { cancelOnDisconnectReason } from "@/lib/orders/cancel-on-disconnect";

test("omitted, null, false, and blank cancel-on-disconnect fields pass", () => {
  expect(cancelOnDisconnectReason(undefined)).toBeNull();
  expect(cancelOnDisconnectReason(null, null, null)).toBeNull();
  expect(cancelOnDisconnectReason(false, "", "  ")).toBeNull();
});

test("present cancel-on-disconnect fields are refused and do not halt", () => {
  expect(cancelOnDisconnectReason(true)).toBe(
    "Cancel on disconnect is not supported; the adapter would leave a resting order",
  );
  expect(cancelOnDisconnectReason(undefined, true)).toBe(
    "Dead-man switch is not supported; the adapter would leave a resting order",
  );
  expect(cancelOnDisconnectReason(undefined, undefined, "1")).toBe(
    "COD flag is not supported; the adapter would leave a resting order",
  );
  expect(cancelOnDisconnectReason(0)).toBe(
    "Cancel on disconnect is not supported; the adapter would leave a resting order",
  );
});
