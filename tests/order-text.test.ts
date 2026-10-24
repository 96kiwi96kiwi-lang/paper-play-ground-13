import { expect, test } from "vitest";
import { orderTextReason } from "@/lib/orders/order-text";

test("omitted, null, false, and blank text aliases pass", () => {
  expect(orderTextReason(undefined)).toBeNull();
  expect(orderTextReason(null, null, null)).toBeNull();
  expect(orderTextReason(false, "", "  ")).toBeNull();
});

test("a present text alias is refused and does not halt", () => {
  expect(orderTextReason("hedge note")).toBe(
    "Text is not supported; the adapter would place a plain spot order",
  );
  expect(orderTextReason(0)).toBe(
    "Text is not supported; the adapter would place a plain spot order",
  );
  expect(orderTextReason(undefined, "client memo")).toBe(
    "Order text is not supported; the adapter would place a plain spot order",
  );
  expect(orderTextReason(undefined, undefined, true)).toBe(
    "Client text is not supported; the adapter would place a plain spot order",
  );
});
