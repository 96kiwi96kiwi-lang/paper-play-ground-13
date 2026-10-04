import { expect, test } from "vitest";
import { clientIdAliasReason } from "@/lib/orders/client-id-alias";

test("omitted, null, and blank client-id aliases pass", () => {
  expect(clientIdAliasReason(undefined)).toBeNull();
  expect(clientIdAliasReason(null, null, null)).toBeNull();
  expect(clientIdAliasReason("", "  ", "")).toBeNull();
});

test("present client-id aliases are refused and do not halt", () => {
  expect(clientIdAliasReason("paper-1")).toBe(
    "Client oid is not supported; the adapter identifies by clientOrderId",
  );
  expect(clientIdAliasReason(undefined, "binance-1")).toBe(
    "New client order id is not supported; the adapter identifies by clientOrderId",
  );
  expect(clientIdAliasReason(undefined, undefined, "replace-1")).toBe(
    "Orig client order id is not supported; the adapter identifies by clientOrderId",
  );
});
