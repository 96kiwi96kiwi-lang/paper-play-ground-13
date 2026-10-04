import { expect, test } from "vitest";
import { tifAliasReason } from "@/lib/orders/tif-alias";

test("omitted, null, blank, and false time-in-force aliases pass", () => {
  expect(tifAliasReason(undefined)).toBeNull();
  expect(tifAliasReason(null, null, null, null)).toBeNull();
  expect(tifAliasReason("", "  ", false, false)).toBeNull();
});

test("present time-in-force aliases are refused and do not halt", () => {
  expect(tifAliasReason("IOC")).toBe("Tif is not supported; the adapter reads timeInForce");
  expect(tifAliasReason(undefined, "FOK")).toBe(
    "Time in force alias is not supported; the adapter reads timeInForce",
  );
  expect(tifAliasReason(undefined, undefined, true)).toBe(
    "Immediate or cancel is not supported; the adapter reads timeInForce",
  );
  expect(tifAliasReason(undefined, undefined, undefined, 1)).toBe(
    "Fill or kill is not supported; the adapter reads timeInForce",
  );
});
