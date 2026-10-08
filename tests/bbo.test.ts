import { expect, test } from "vitest";
import { bboReason } from "@/lib/orders/bbo";

test("omitted, blank, and false pass", () => {
  expect(bboReason(undefined)).toBeNull();
  expect(bboReason(null, null, null)).toBeNull();
  expect(bboReason("", "  ", false)).toBeNull();
  expect(bboReason(false, false, false)).toBeNull();
});

test("a present book price is refused and does not halt", () => {
  expect(bboReason(true)).toBe(
    "BBO is not supported; the adapter would place a normal spot order",
  );
  expect(bboReason("queue")).toBe(
    "BBO is not supported; the adapter would place a normal spot order",
  );
  expect(bboReason(undefined, "bid")).toBe(
    "Best bid offer is not supported; the adapter would place a normal spot order",
  );
  expect(bboReason(undefined, undefined, "ask")).toBe(
    "Book price is not supported; the adapter would place a normal spot order",
  );
  expect(bboReason(undefined, undefined, 0)).toBe(
    "Book price is not supported; the adapter would place a normal spot order",
  );
});
