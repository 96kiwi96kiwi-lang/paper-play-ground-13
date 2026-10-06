import { expect, test } from "vitest";
import { orderRemarkReason } from "@/lib/orders/order-remark";

test("omitted, null, false, and blank notes pass", () => {
  expect(orderRemarkReason(undefined)).toBeNull();
  expect(orderRemarkReason(null, null, null)).toBeNull();
  expect(orderRemarkReason(false, "", "  ")).toBeNull();
});

test("a present client note is refused and does not halt", () => {
  expect(orderRemarkReason("reconcile-1")).toBe(
    "Remark is not supported; the adapter would drop the client note",
  );
  expect(orderRemarkReason(0)).toBe(
    "Remark is not supported; the adapter would drop the client note",
  );
  expect(orderRemarkReason(undefined, "grid")).toBe(
    "Tag is not supported; the adapter would drop the client note",
  );
  expect(orderRemarkReason(undefined, undefined, true)).toBe(
    "Client tag is not supported; the adapter would drop the client note",
  );
});
