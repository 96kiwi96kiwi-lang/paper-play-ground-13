import { expect, test } from "vitest";
import { baseSizeReason } from "@/lib/orders/base-size";

test("omitted, null, and blank size aliases pass", () => {
  expect(baseSizeReason(undefined)).toBeNull();
  expect(baseSizeReason(null, null, null, null)).toBeNull();
  expect(baseSizeReason("", "  ", "", "\t")).toBeNull();
});

test("present size aliases are refused and do not halt", () => {
  expect(baseSizeReason(0.01)).toBe("Size is not supported; the adapter sizes by amount");
  expect(baseSizeReason(0)).toBe("Size is not supported; the adapter sizes by amount");
  expect(baseSizeReason(undefined, 1)).toBe(
    "Quantity is not supported; the adapter sizes by amount",
  );
  expect(baseSizeReason(undefined, undefined, "0.5")).toBe(
    "Qty is not supported; the adapter sizes by amount",
  );
  expect(baseSizeReason(undefined, undefined, undefined, 2)).toBe(
    "Base size is not supported; the adapter sizes by amount",
  );
});
