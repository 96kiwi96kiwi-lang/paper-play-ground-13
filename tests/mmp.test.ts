import { expect, test } from "vitest";
import { mmpReason } from "@/lib/orders/mmp";

test("omitted, blank, and false pass", () => {
  expect(mmpReason(undefined)).toBeNull();
  expect(mmpReason(null, null, null)).toBeNull();
  expect(mmpReason("", "  ", false)).toBeNull();
  expect(mmpReason(false, false, false)).toBeNull();
});

test("a present market-maker protection is refused and does not halt", () => {
  expect(mmpReason(true)).toBe(
    "MMP is not supported; the adapter would place a normal spot order",
  );
  expect(mmpReason("enabled")).toBe(
    "MMP is not supported; the adapter would place a normal spot order",
  );
  expect(mmpReason(undefined, "group-a")).toBe(
    "MMP group is not supported; the adapter would place a normal spot order",
  );
  expect(mmpReason(undefined, undefined, true)).toBe(
    "Market maker protection is not supported; the adapter would place a normal spot order",
  );
  expect(mmpReason(undefined, undefined, 0)).toBe(
    "Market maker protection is not supported; the adapter would place a normal spot order",
  );
});
