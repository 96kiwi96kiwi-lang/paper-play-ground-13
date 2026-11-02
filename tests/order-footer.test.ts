import { expect, test } from "vitest";
import { orderFooterReason } from "@/lib/orders/order-footer";

test("omitted, null, false, and blank footer aliases pass", () => {
  expect(orderFooterReason(undefined)).toBeNull();
  expect(orderFooterReason(null, null, null)).toBeNull();
  expect(orderFooterReason(false, "", "  ")).toBeNull();
});

test("a present footer alias is refused and does not halt", () => {
  expect(orderFooterReason("hedge note")).toBe(
    "Footer is not supported; the adapter would place a plain spot order",
  );
  expect(orderFooterReason(0)).toBe(
    "Footer is not supported; the adapter would place a plain spot order",
  );
  expect(orderFooterReason(undefined, "client memo")).toBe(
    "Order footer is not supported; the adapter would place a plain spot order",
  );
  expect(orderFooterReason(undefined, undefined, true)).toBe(
    "Client footer is not supported; the adapter would place a plain spot order",
  );
});
