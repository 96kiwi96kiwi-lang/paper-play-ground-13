import { expect, test } from "vitest";
import { orderMetadataReason } from "@/lib/orders/order-metadata";

test("omitted, blank, and false pass", () => {
  expect(orderMetadataReason(undefined)).toBeNull();
  expect(orderMetadataReason(null, null, null)).toBeNull();
  expect(orderMetadataReason("", "  ", false)).toBeNull();
  expect(orderMetadataReason(false, false, false)).toBeNull();
});

test("a present metadata is refused and does not halt", () => {
  expect(orderMetadataReason("grid-meta")).toBe(
    "Order metadata is not supported; the adapter would place a plain spot order",
  );
  expect(orderMetadataReason(0)).toBe(
    "Order metadata is not supported; the adapter would place a plain spot order",
  );
  expect(orderMetadataReason(undefined, "bybit-meta")).toBe(
    "Order metadata alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderMetadataReason(undefined, undefined, "client-meta")).toBe(
    "Client metadata alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderMetadataReason(undefined, undefined, true)).toBe(
    "Client metadata alias is not supported; the adapter would place a plain spot order",
  );
});
