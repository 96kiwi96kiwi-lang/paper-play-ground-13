import { expect, test } from "vitest";
import { orderVersionReason } from "@/lib/orders/order-version";

test("omitted, null, false, and blank version aliases pass", () => {
  expect(orderVersionReason(undefined)).toBeNull();
  expect(orderVersionReason(null, null, null)).toBeNull();
  expect(orderVersionReason(false, "", "  ")).toBeNull();
});

test("a present version alias is refused and does not halt", () => {
  expect(orderVersionReason("v1")).toBe(
    "Version is not supported; the adapter would place a plain spot order",
  );
  expect(orderVersionReason(0)).toBe(
    "Version is not supported; the adapter would place a plain spot order",
  );
  expect(orderVersionReason(undefined, "ord-v-456")).toBe(
    "Order version is not supported; the adapter would place a plain spot order",
  );
  expect(orderVersionReason(undefined, undefined, true)).toBe(
    "Client version is not supported; the adapter would place a plain spot order",
  );
});
