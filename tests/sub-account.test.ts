import { expect, test } from "vitest";
import { subAccountReason } from "@/lib/orders/sub-account";

test("omitted, null, false, and blank sub-account routes pass", () => {
  expect(subAccountReason(undefined)).toBeNull();
  expect(subAccountReason(null, null, null)).toBeNull();
  expect(subAccountReason(false, "", "  ")).toBeNull();
});

test("a present sub-account route is refused and does not halt", () => {
  expect(subAccountReason("trade-sub")).toBe(
    "Sub account is not supported; the adapter would use the server key account",
  );
  expect(subAccountReason(0)).toBe(
    "Sub account is not supported; the adapter would use the server key account",
  );
  expect(subAccountReason(undefined, "88421")).toBe(
    "Sub uid is not supported; the adapter would use the server key account",
  );
  expect(subAccountReason(undefined, undefined, true)).toBe(
    "Uid is not supported; the adapter would use the server key account",
  );
});
