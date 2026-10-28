import { expect, test } from "vitest";
import { orderHashReason } from "@/lib/orders/order-hash";

test("omitted, null, false, and blank hash aliases pass", () => {
  expect(orderHashReason(undefined)).toBeNull();
  expect(orderHashReason(null, null, null)).toBeNull();
  expect(orderHashReason(false, "", "  ")).toBeNull();
});

test("a present hash alias is refused and does not halt", () => {
  expect(orderHashReason("sha256-abc123")).toBe(
    "Hash is not supported; the adapter would place a plain spot order",
  );
  expect(orderHashReason(0)).toBe(
    "Hash is not supported; the adapter would place a plain spot order",
  );
  expect(orderHashReason(undefined, "ord-hash")).toBe(
    "Order hash is not supported; the adapter would place a plain spot order",
  );
  expect(orderHashReason(undefined, undefined, true)).toBe(
    "Client hash is not supported; the adapter would place a plain spot order",
  );
});
