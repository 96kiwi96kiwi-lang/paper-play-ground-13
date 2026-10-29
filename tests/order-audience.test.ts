import { expect, test } from "vitest";
import { orderAudienceReason } from "@/lib/orders/order-audience";

test("omitted, blank, and false pass", () => {
  expect(orderAudienceReason(undefined)).toBeNull();
  expect(orderAudienceReason(null, null, null)).toBeNull();
  expect(orderAudienceReason("", "  ", false)).toBeNull();
  expect(orderAudienceReason(false, false, false)).toBeNull();
});

test("a present audience is refused and does not halt", () => {
  expect(orderAudienceReason("public")).toBe(
    "Order audience is not supported; the adapter would place a plain spot order",
  );
  expect(orderAudienceReason(0)).toBe(
    "Order audience is not supported; the adapter would place a plain spot order",
  );
  expect(orderAudienceReason(undefined, "vip")).toBe(
    "Order audience alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderAudienceReason(undefined, undefined, "client-only")).toBe(
    "Client audience alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderAudienceReason(undefined, undefined, true)).toBe(
    "Client audience alias is not supported; the adapter would place a plain spot order",
  );
});
