import { expect, test } from "vitest";
import { icebergReason } from "@/lib/orders/iceberg";

test("omitted and false iceberg flags pass", () => {
  expect(icebergReason(undefined)).toBeNull();
  expect(icebergReason(null)).toBeNull();
  expect(icebergReason(false)).toBeNull();
  expect(icebergReason("")).toBeNull();
  expect(icebergReason("  ", "")).toBeNull();
  expect(icebergReason(false, null)).toBeNull();
  expect(icebergReason(false, null, null, "", "  ")).toBeNull();
  expect(icebergReason(false, null, null, null, null, "", "  ", null)).toBeNull();
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

test("iceberg qty aliases are refused and do not halt", () => {
  expect(icebergReason(false, undefined, 0.01)).toBe(
    "Iceberg qty is not supported; the adapter would show the full size",
  );
  expect(icebergReason(undefined, undefined, undefined, "0.2")).toBe(
    "Display qty is not supported; the adapter would show the full size",
  );
  expect(icebergReason(false, null, null, null, 0)).toBe(
    "Hidden size is not supported; the adapter would show the full size",
  );
});

test("display size aliases are refused and do not halt", () => {
  expect(icebergReason(false, undefined, undefined, undefined, undefined, 0.05)).toBe(
    "Display size is not supported; the adapter would show the full size",
  );
  expect(icebergReason(undefined, undefined, undefined, undefined, undefined, undefined, "0.1")).toBe(
    "Visible qty is not supported; the adapter would show the full size",
  );
  expect(icebergReason(false, null, null, null, null, null, null, 0)).toBe(
    "Iceberg size is not supported; the adapter would show the full size",
  );
});
