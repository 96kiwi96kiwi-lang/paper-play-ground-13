import { expect, test } from "vitest";
import { orderOutlineReason } from "@/lib/orders/order-outline";

test("omitted, null, false, and blank outline aliases pass", () => {
  expect(orderOutlineReason(undefined)).toBeNull();
  expect(orderOutlineReason(null, null, null)).toBeNull();
  expect(orderOutlineReason(false, "", "  ")).toBeNull();
});

test("a present outline alias is refused and does not halt", () => {
  expect(orderOutlineReason("hedge note")).toBe(
    "Order outline is not supported; the adapter would place a plain spot order",
  );
  expect(orderOutlineReason(0)).toBe(
    "Order outline is not supported; the adapter would place a plain spot order",
  );
  expect(orderOutlineReason(undefined, "client memo")).toBe(
    "Order outline alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderOutlineReason(undefined, undefined, true)).toBe(
    "Client outline alias is not supported; the adapter would place a plain spot order",
  );
});
