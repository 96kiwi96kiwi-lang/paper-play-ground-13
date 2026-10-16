import { expect, test } from "vitest";
import { tifAliasReason } from "@/lib/orders/tif-alias";

test("omitted, null, and blank tif aliases pass", () => {
  expect(tifAliasReason(undefined)).toBeNull();
  expect(tifAliasReason(null, null, null)).toBeNull();
  expect(tifAliasReason("", "  ", "\t")).toBeNull();
});

test("present tif aliases are refused and do not halt", () => {
  expect(tifAliasReason("GTC")).toBe(
    "Tif alias is not supported; the adapter reads timeInForce",
  );
  expect(tifAliasReason(undefined, "IOC")).toBe(
    "Order tif alias is not supported; the adapter reads timeInForce",
  );
  expect(tifAliasReason(undefined, undefined, "FOK")).toBe(
    "Time in force alias is not supported; the adapter reads timeInForce",
  );
  expect(tifAliasReason(0)).toBe(
    "Tif alias is not supported; the adapter reads timeInForce",
  );
});
