import { expect, test } from "vitest";
import { orderDigestReason } from "@/lib/orders/order-digest";

test("omitted, null, false, and blank digest aliases pass", () => {
  expect(orderDigestReason(undefined)).toBeNull();
  expect(orderDigestReason(null, null, null)).toBeNull();
  expect(orderDigestReason(false, "", "  ")).toBeNull();
});

test("a present digest alias is refused and does not halt", () => {
  expect(orderDigestReason("hedge note")).toBe(
    "Order digest is not supported; the adapter would place a plain spot order",
  );
  expect(orderDigestReason(0)).toBe(
    "Order digest is not supported; the adapter would place a plain spot order",
  );
  expect(orderDigestReason(undefined, "client memo")).toBe(
    "Order digest alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderDigestReason(undefined, undefined, true)).toBe(
    "Client digest alias is not supported; the adapter would place a plain spot order",
  );
});
