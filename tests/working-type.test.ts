import { expect, test } from "vitest";
import { workingTypeReason } from "@/lib/orders/working-type";

test("omitted, null, false, and blank working-type fields pass", () => {
  expect(workingTypeReason(undefined)).toBeNull();
  expect(workingTypeReason(null, null, null)).toBeNull();
  expect(workingTypeReason(false, "", "  ")).toBeNull();
});

test("present working-type fields are refused and do not halt", () => {
  expect(workingTypeReason("MARK_PRICE")).toBe(
    "Working type is not supported; the adapter would place without a mark or last trigger",
  );
  expect(workingTypeReason(undefined, "CONTRACT_PRICE")).toBe(
    "Stop working type is not supported; the adapter would place without a mark or last trigger",
  );
  expect(workingTypeReason(undefined, undefined, 0)).toBe(
    "Trigger by is not supported; the adapter would place without a mark or last trigger",
  );
});
