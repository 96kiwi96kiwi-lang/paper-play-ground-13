import { expect, test } from "vitest";
import { orderCaptionReason } from "@/lib/orders/order-caption";

test("omitted, null, false, and blank caption aliases pass", () => {
  expect(orderCaptionReason(undefined)).toBeNull();
  expect(orderCaptionReason(null, null, null)).toBeNull();
  expect(orderCaptionReason(false, "", "  ")).toBeNull();
});

test("a present caption alias is refused and does not halt", () => {
  expect(orderCaptionReason("hedge note")).toBe(
    "Caption is not supported; the adapter would place a plain spot order",
  );
  expect(orderCaptionReason(0)).toBe(
    "Caption is not supported; the adapter would place a plain spot order",
  );
  expect(orderCaptionReason(undefined, "client memo")).toBe(
    "Order caption is not supported; the adapter would place a plain spot order",
  );
  expect(orderCaptionReason(undefined, undefined, true)).toBe(
    "Client caption is not supported; the adapter would place a plain spot order",
  );
});
