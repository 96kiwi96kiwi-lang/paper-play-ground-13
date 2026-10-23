import { expect, test } from "vitest";
import { orderCustomReason } from "@/lib/orders/order-custom";

test("omitted, null, false, and blank metadata pass", () => {
  expect(orderCustomReason(undefined)).toBeNull();
  expect(orderCustomReason(null, null, null)).toBeNull();
  expect(orderCustomReason(false, "", "  ")).toBeNull();
});

test("a present client metadata is refused and does not halt", () => {
  expect(orderCustomReason("reconcile-1")).toBe(
    "Custom is not supported; the adapter would drop the client metadata",
  );
  expect(orderCustomReason(0)).toBe(
    "Custom is not supported; the adapter would drop the client metadata",
  );
  expect(orderCustomReason(undefined, "grid")).toBe(
    "Custom field is not supported; the adapter would drop the client metadata",
  );
  expect(orderCustomReason(undefined, undefined, true)).toBe(
    "Client custom is not supported; the adapter would drop the client metadata",
  );
});
