import { expect, test } from "vitest";
import { orderUuidReason } from "@/lib/orders/order-uuid";

test("omitted, null, false, and blank uuid aliases pass", () => {
  expect(orderUuidReason(undefined)).toBeNull();
  expect(orderUuidReason(null, null, null)).toBeNull();
  expect(orderUuidReason(false, "", "  ")).toBeNull();
});

test("a present uuid alias is refused and does not halt", () => {
  expect(orderUuidReason("550e8400-e29b-41d4-a716-446655440000")).toBe(
    "Uuid is not supported; the adapter would place a plain spot order",
  );
  expect(orderUuidReason(0)).toBe(
    "Uuid is not supported; the adapter would place a plain spot order",
  );
  expect(orderUuidReason(undefined, "client-uuid-note")).toBe(
    "Order uuid is not supported; the adapter would place a plain spot order",
  );
  expect(orderUuidReason(undefined, undefined, true)).toBe(
    "Client uuid is not supported; the adapter would place a plain spot order",
  );
});
