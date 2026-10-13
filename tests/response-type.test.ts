import { expect, test } from "vitest";
import { responseTypeReason } from "@/lib/orders/response-type";

test("omitted, blank, and false pass", () => {
  expect(responseTypeReason(undefined)).toBeNull();
  expect(responseTypeReason(null, null, null)).toBeNull();
  expect(responseTypeReason("", "  ", false)).toBeNull();
  expect(responseTypeReason(false, false, false)).toBeNull();
});

test("a present response type is refused and does not halt", () => {
  expect(responseTypeReason("FULL")).toBe(
    "Order response type is not supported; the adapter would return a unified order",
  );
  expect(responseTypeReason("RESULT")).toBe(
    "Order response type is not supported; the adapter would return a unified order",
  );
  expect(responseTypeReason(undefined, "ACK")).toBe(
    "Response type is not supported; the adapter would return a unified order",
  );
  expect(responseTypeReason(undefined, undefined, 0)).toBe(
    "Resp type is not supported; the adapter would return a unified order",
  );
});
