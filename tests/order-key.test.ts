import { expect, test } from "vitest";
import { orderKeyReason } from "@/lib/orders/order-key";

test("omitted, null, false, and blank key aliases pass", () => {
  expect(orderKeyReason(undefined)).toBeNull();
  expect(orderKeyReason(null, null, null)).toBeNull();
  expect(orderKeyReason(false, "", "  ")).toBeNull();
});

test("a present key alias is refused and does not halt", () => {
  expect(orderKeyReason("abc123")).toBe(
    "Key is not supported; the adapter would place a plain spot order",
  );
  expect(orderKeyReason(0)).toBe(
    "Key is not supported; the adapter would place a plain spot order",
  );
  expect(orderKeyReason(undefined, "ord-key")).toBe(
    "Order key is not supported; the adapter would place a plain spot order",
  );
  expect(orderKeyReason(undefined, undefined, true)).toBe(
    "Client key is not supported; the adapter would place a plain spot order",
  );
});
