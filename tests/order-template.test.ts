import { expect, test } from "vitest";
import { orderTemplateReason } from "@/lib/orders/order-template";

test("omitted, null, false, and blank template aliases pass", () => {
  expect(orderTemplateReason(undefined)).toBeNull();
  expect(orderTemplateReason(null, null, null)).toBeNull();
  expect(orderTemplateReason(false, "", "  ")).toBeNull();
});

test("a present template alias is refused and does not halt", () => {
  expect(orderTemplateReason("grid")).toBe(
    "Template is not supported; the adapter would place a plain spot order",
  );
  expect(orderTemplateReason(0)).toBe(
    "Template is not supported; the adapter would place a plain spot order",
  );
  expect(orderTemplateReason(undefined, "ladder")).toBe(
    "Order template is not supported; the adapter would place a plain spot order",
  );
  expect(orderTemplateReason(undefined, undefined, true)).toBe(
    "Client template is not supported; the adapter would place a plain spot order",
  );
});
