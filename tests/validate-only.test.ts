import { expect, test } from "vitest";
import { validateOnlyReason } from "@/lib/orders/validate-only";

test("omitted, null, false, and blank rehearsal flags pass", () => {
  expect(validateOnlyReason(undefined)).toBeNull();
  expect(validateOnlyReason(null, null, null)).toBeNull();
  expect(validateOnlyReason(false, "", "  ")).toBeNull();
});

test("present rehearsal flags are refused and do not halt", () => {
  expect(validateOnlyReason(true)).toBe(
    "Test order is not supported; the adapter would place a real spot order",
  );
  expect(validateOnlyReason(undefined, "true")).toBe(
    "Dry run is not supported; the adapter would place a real spot order",
  );
  expect(validateOnlyReason(undefined, undefined, 0)).toBe(
    "Validate only is not supported; the adapter would place a real spot order",
  );
});
