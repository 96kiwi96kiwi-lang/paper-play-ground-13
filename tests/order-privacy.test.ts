import { expect, test } from "vitest";
import { orderPrivacyReason } from "@/lib/orders/order-privacy";

test("omitted, blank, and false pass", () => {
  expect(orderPrivacyReason(undefined)).toBeNull();
  expect(orderPrivacyReason(null, null, null)).toBeNull();
  expect(orderPrivacyReason("", "  ", false)).toBeNull();
  expect(orderPrivacyReason(false, false, false)).toBeNull();
});

test("a present privacy is refused and does not halt", () => {
  expect(orderPrivacyReason("private")).toBe(
    "Order privacy is not supported; the adapter would place a plain spot order",
  );
  expect(orderPrivacyReason(0)).toBe(
    "Order privacy is not supported; the adapter would place a plain spot order",
  );
  expect(orderPrivacyReason(undefined, "confidential")).toBe(
    "Order privacy alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderPrivacyReason(undefined, undefined, "client-private")).toBe(
    "Client privacy alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderPrivacyReason(undefined, undefined, true)).toBe(
    "Client privacy alias is not supported; the adapter would place a plain spot order",
  );
});
