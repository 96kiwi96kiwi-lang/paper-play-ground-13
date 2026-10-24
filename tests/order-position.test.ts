import { expect, test } from "vitest";
import { orderPositionReason } from "@/lib/orders/order-position";

test("omitted, null, false, and blank position aliases pass", () => {
  expect(orderPositionReason(undefined)).toBeNull();
  expect(orderPositionReason(null, null, null)).toBeNull();
  expect(orderPositionReason(false, "", "  ")).toBeNull();
});

test("a present position alias is refused and does not halt", () => {
  expect(orderPositionReason("long-1")).toBe(
    "Position is not supported; the adapter would place a plain spot order",
  );
  expect(orderPositionReason(0)).toBe(
    "Position is not supported; the adapter would place a plain spot order",
  );
  expect(orderPositionReason(undefined, "hedge-short")).toBe(
    "Order position is not supported; the adapter would place a plain spot order",
  );
  expect(orderPositionReason(undefined, undefined, true)).toBe(
    "Client position is not supported; the adapter would place a plain spot order",
  );
});
