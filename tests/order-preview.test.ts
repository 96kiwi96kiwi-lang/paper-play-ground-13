import { expect, test } from "vitest";
import { orderPreviewReason } from "@/lib/orders/order-preview";

test("omitted, null, false, and blank preview aliases pass", () => {
  expect(orderPreviewReason(undefined)).toBeNull();
  expect(orderPreviewReason(null, null, null)).toBeNull();
  expect(orderPreviewReason(false, "", "  ")).toBeNull();
});

test("a present preview alias is refused and does not halt", () => {
  expect(orderPreviewReason("hedge note")).toBe(
    "Order preview is not supported; the adapter would place a plain spot order",
  );
  expect(orderPreviewReason(0)).toBe(
    "Order preview is not supported; the adapter would place a plain spot order",
  );
  expect(orderPreviewReason(undefined, "client memo")).toBe(
    "Order preview alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderPreviewReason(undefined, undefined, true)).toBe(
    "Client preview alias is not supported; the adapter would place a plain spot order",
  );
});
