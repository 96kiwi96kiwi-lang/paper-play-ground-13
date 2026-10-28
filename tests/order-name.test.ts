import { expect, test } from "vitest";
import { orderNameReason } from "@/lib/orders/order-name";

test("omitted, null, false, and blank name aliases pass", () => {
  expect(orderNameReason(undefined)).toBeNull();
  expect(orderNameReason(null, null, null)).toBeNull();
  expect(orderNameReason(false, "", "  ")).toBeNull();
});

test("a present name alias is refused and does not halt", () => {
  expect(orderNameReason("my-order")).toBe(
    "Name is not supported; the adapter would place a plain spot order",
  );
  expect(orderNameReason(0)).toBe(
    "Name is not supported; the adapter would place a plain spot order",
  );
  expect(orderNameReason(undefined, "ord-name")).toBe(
    "Order name is not supported; the adapter would place a plain spot order",
  );
  expect(orderNameReason(undefined, undefined, true)).toBe(
    "Client name is not supported; the adapter would place a plain spot order",
  );
});
