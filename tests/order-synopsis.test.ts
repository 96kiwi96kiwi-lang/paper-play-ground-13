import { expect, test } from "vitest";
import { orderSynopsisReason } from "@/lib/orders/order-synopsis";

test("omitted, null, false, and blank synopsis aliases pass", () => {
  expect(orderSynopsisReason(undefined)).toBeNull();
  expect(orderSynopsisReason(null, null, null)).toBeNull();
  expect(orderSynopsisReason(false, "", "  ")).toBeNull();
});

test("a present synopsis alias is refused and does not halt", () => {
  expect(orderSynopsisReason("hedge note")).toBe(
    "Order synopsis is not supported; the adapter would place a plain spot order",
  );
  expect(orderSynopsisReason(0)).toBe(
    "Order synopsis is not supported; the adapter would place a plain spot order",
  );
  expect(orderSynopsisReason(undefined, "client memo")).toBe(
    "Order synopsis alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderSynopsisReason(undefined, undefined, true)).toBe(
    "Client synopsis alias is not supported; the adapter would place a plain spot order",
  );
});
