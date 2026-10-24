import { expect, test } from "vitest";
import { workingTypeReason } from "@/lib/orders/working-type";

test("omitted, null, false, and blank working type aliases pass", () => {
  expect(workingTypeReason(undefined)).toBeNull();
  expect(workingTypeReason(null, null, null)).toBeNull();
  expect(workingTypeReason(false, "", "  ")).toBeNull();
});

test("a present working type alias is refused and does not halt", () => {
  expect(workingTypeReason("MARK_PRICE")).toBe(
    "Working type is not supported; the adapter would place without a mark or last trigger",
  );
  expect(workingTypeReason(0)).toBe(
    "Working type is not supported; the adapter would place without a mark or last trigger",
  );
  expect(workingTypeReason(undefined, "INDEX_PRICE")).toBe(
    "Stop working type is not supported; the adapter would place without a mark or last trigger",
  );
  expect(workingTypeReason(undefined, undefined, true)).toBe(
    "Trigger by is not supported; the adapter would place without a mark or last trigger",
  );
});
