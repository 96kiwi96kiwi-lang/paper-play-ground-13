import { expect, test } from "vitest";
import { orderNoteReason } from "@/lib/orders/order-note";

test("omitted, blank, and false pass", () => {
  expect(orderNoteReason(undefined)).toBeNull();
  expect(orderNoteReason(null, null, null)).toBeNull();
  expect(orderNoteReason("", "  ", false)).toBeNull();
  expect(orderNoteReason(false, false, false)).toBeNull();
});

test("a present note is refused and does not halt", () => {
  expect(orderNoteReason("grid-note")).toBe(
    "Order note is not supported; the adapter would place a plain spot order",
  );
  expect(orderNoteReason(0)).toBe(
    "Order note is not supported; the adapter would place a plain spot order",
  );
  expect(orderNoteReason(undefined, "bybit-note")).toBe(
    "Order note alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderNoteReason(undefined, undefined, "client-note")).toBe(
    "Client note alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderNoteReason(undefined, undefined, true)).toBe(
    "Client note alias is not supported; the adapter would place a plain spot order",
  );
});
