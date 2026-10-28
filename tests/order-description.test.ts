import { expect, test } from "vitest";
import { orderDescriptionReason } from "@/lib/orders/order-description";

test("omitted, null, false, and blank description aliases pass", () => {
  expect(orderDescriptionReason(undefined)).toBeNull();
  expect(orderDescriptionReason(null, null, null)).toBeNull();
  expect(orderDescriptionReason(false, "", "  ")).toBeNull();
});

test("a present description alias is refused and does not halt", () => {
  expect(orderDescriptionReason("hedge note")).toBe(
    "Order description is not supported; the adapter would place a plain spot order",
  );
  expect(orderDescriptionReason(0)).toBe(
    "Order description is not supported; the adapter would place a plain spot order",
  );
  expect(orderDescriptionReason(undefined, "client memo")).toBe(
    "Order description alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderDescriptionReason(undefined, undefined, true)).toBe(
    "Client description alias is not supported; the adapter would place a plain spot order",
  );
});
