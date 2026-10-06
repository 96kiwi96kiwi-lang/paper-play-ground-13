import { expect, test } from "vitest";
import { categoryReason } from "@/lib/orders/category";

test("omitted, null, false, blank, and spot labels pass", () => {
  expect(categoryReason(undefined)).toBeNull();
  expect(categoryReason(null, null, null)).toBeNull();
  expect(categoryReason(false, "", "  ")).toBeNull();
  expect(categoryReason("spot", "CASH", " spot ")).toBeNull();
  expect(categoryReason(undefined, "Spot", undefined)).toBeNull();
});

test("a non-spot product label is refused and does not halt", () => {
  expect(categoryReason("linear")).toBe(
    "Category is not supported; the adapter would place a spot order",
  );
  expect(categoryReason(0)).toBe(
    "Category is not supported; the adapter would place a spot order",
  );
  expect(categoryReason(undefined, "inverse")).toBe(
    "Product type is not supported; the adapter would place a spot order",
  );
  expect(categoryReason(undefined, undefined, "SWAP")).toBe(
    "Instrument type is not supported; the adapter would place a spot order",
  );
  expect(categoryReason(undefined, undefined, "margin")).toBe(
    "Instrument type is not supported; the adapter would place a spot order",
  );
});
