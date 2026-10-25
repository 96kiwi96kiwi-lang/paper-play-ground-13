import { expect, test } from "vitest";
import { orderExternalReason } from "@/lib/orders/order-external";

test("omitted, null, false, and blank external aliases pass", () => {
  expect(orderExternalReason(undefined)).toBeNull();
  expect(orderExternalReason(null, null, null)).toBeNull();
  expect(orderExternalReason(false, "", "  ")).toBeNull();
});

test("a present external alias is refused and does not halt", () => {
  expect(orderExternalReason("ext-abc123")).toBe(
    "External id is not supported; the adapter would place a plain spot order",
  );
  expect(orderExternalReason(0)).toBe(
    "External id is not supported; the adapter would place a plain spot order",
  );
  expect(orderExternalReason(undefined, "ord-ext")).toBe(
    "Order external is not supported; the adapter would place a plain spot order",
  );
  expect(orderExternalReason(undefined, undefined, true)).toBe(
    "Client external is not supported; the adapter would place a plain spot order",
  );
});
