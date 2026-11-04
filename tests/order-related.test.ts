import { expect, test } from "vitest";
import { orderRelatedReason } from "@/lib/orders/order-related";

test("omitted, null, false, and blank related aliases pass", () => {
  expect(orderRelatedReason(undefined)).toBeNull();
  expect(orderRelatedReason(null, null, null)).toBeNull();
  expect(orderRelatedReason(false, "", "  ")).toBeNull();
});

test("a present related alias is refused and does not halt", () => {
  expect(orderRelatedReason("rel-1")).toBe(
    "Related id is not supported; the adapter would place a plain spot order",
  );
  expect(orderRelatedReason(0)).toBe(
    "Related id is not supported; the adapter would place a plain spot order",
  );
  expect(orderRelatedReason(undefined, "ord-related")).toBe(
    "Order related is not supported; the adapter would place a plain spot order",
  );
  expect(orderRelatedReason(undefined, undefined, true)).toBe(
    "Client related is not supported; the adapter would place a plain spot order",
  );
});
