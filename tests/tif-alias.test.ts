import { expect, test } from "vitest";
import { tifAliasReason } from "@/lib/orders/tif-alias";

test("omitted, null, and blank tif aliases pass", () => {
  expect(tifAliasReason(undefined)).toBeNull();
  expect(tifAliasReason(null, null, null)).toBeNull();
  expect(tifAliasReason("", "  ", "\t")).toBeNull();
  expect(tifAliasReason(undefined, undefined, undefined, false, false)).toBeNull();
});

test("present tif aliases are refused and do not halt", () => {
  expect(tifAliasReason("IOC")).toBe(
    "Tif alias is not supported; the adapter reads timeInForce",
  );
  expect(tifAliasReason(undefined, "FOK")).toBe(
    "Order tif alias is not supported; the adapter reads timeInForce",
  );
  expect(tifAliasReason(undefined, undefined, "GTC")).toBe(
    "Time in force alias is not supported; the adapter reads timeInForce",
  );
  expect(tifAliasReason(undefined, undefined, undefined, true)).toBe(
    "Immediate or cancel is not supported; the adapter reads timeInForce",
  );
  expect(tifAliasReason(undefined, undefined, undefined, undefined, true)).toBe(
    "Fill or kill is not supported; the adapter reads timeInForce",
  );
  expect(tifAliasReason(0)).toBe(
    "Tif alias is not supported; the adapter reads timeInForce",
  );
});
