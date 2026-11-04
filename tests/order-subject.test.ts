import { expect, test } from "vitest";
import { orderSubjectReason } from "@/lib/orders/order-subject";

test("omitted, null, false, and blank subject aliases pass", () => {
  expect(orderSubjectReason(undefined)).toBeNull();
  expect(orderSubjectReason(null, null, null)).toBeNull();
  expect(orderSubjectReason(false, "", "  ")).toBeNull();
});

test("a present subject alias is refused and does not halt", () => {
  expect(orderSubjectReason("hedge note")).toBe(
    "Subject is not supported; the adapter would place a plain spot order",
  );
  expect(orderSubjectReason(0)).toBe(
    "Subject is not supported; the adapter would place a plain spot order",
  );
  expect(orderSubjectReason(undefined, "client memo")).toBe(
    "Order subject is not supported; the adapter would place a plain spot order",
  );
  expect(orderSubjectReason(undefined, undefined, true)).toBe(
    "Client subject is not supported; the adapter would place a plain spot order",
  );
});
