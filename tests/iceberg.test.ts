import { expect, test } from "vitest";
import { icebergReason } from "@/lib/orders/iceberg";

test("omitted and false iceberg flags pass", () => {
  expect(icebergReason(undefined)).toBeNull();
  expect(icebergReason(null)).toBeNull();
  expect(icebergReason(false)).toBeNull();
  expect(icebergReason("")).toBeNull();
  expect(icebergReason("  ", "")).toBeNull();
  expect(icebergReason(false, null)).toBeNull();
});

test("a true iceberg or hidden flag is refused and does not halt", () => {
  expect(icebergReason(true)).toBe(
    "Iceberg is not supported; the adapter would show the full size",
  );
  expect(icebergReason(true, undefined)).toBe(
    "Iceberg is not supported; the adapter would show the full size",
  );
});

test("a bad flag shape is refused", () => {
  expect(icebergReason("yes")).toBe("Iceberg must be omitted or false");
  expect(icebergReason(1)).toBe("Iceberg must be omitted or false");
});

test("a present visible size is refused even when the flag is off", () => {
  expect(icebergReason(false, 0.1)).toBe(
    "Visible size is not supported; the adapter would show the full size",
  );
  expect(icebergReason(undefined, "0.01")).toBe(
    "Visible size is not supported; the adapter would show the full size",
  );
  expect(icebergReason(false, 0)).toBe(
    "Visible size is not supported; the adapter would show the full size",
  );
});
