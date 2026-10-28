import { expect, test } from "vitest";
import { closePositionReason } from "@/lib/orders/close-position";

test("omitted, null, false, and blank pass", () => {
  expect(closePositionReason(undefined)).toBeNull();
  expect(closePositionReason(null)).toBeNull();
  expect(closePositionReason(false)).toBeNull();
  expect(closePositionReason("")).toBeNull();
  expect(closePositionReason("   ")).toBeNull();
  expect(closePositionReason(undefined, undefined, undefined)).toBeNull();
  expect(closePositionReason(null, null, null)).toBeNull();
  expect(closePositionReason(false, false, false)).toBeNull();
});

test("true closePosition is refused and does not halt", () => {
  expect(closePositionReason(true)).toBe(
    "Close position is not supported; the adapter would place a normal spot order",
  );
});

test("present closeOnTrigger is refused", () => {
  expect(closePositionReason(undefined, true)).toBe(
    "Close on trigger is not supported; the adapter would place a normal spot order",
  );
  expect(closePositionReason(null, "yes")).toBe(
    "Close on trigger is not supported; the adapter would place a normal spot order",
  );
});

test("present closeOrder is refused", () => {
  expect(closePositionReason(undefined, undefined, true)).toBe(
    "Close order is not supported; the adapter would place a normal spot order",
  );
  expect(closePositionReason(false, false, 1)).toBe(
    "Close order is not supported; the adapter would place a normal spot order",
  );
});

test("zero is refused as present", () => {
  expect(closePositionReason(0)).toBe(
    "Close position is not supported; the adapter would place a normal spot order",
  );
});
