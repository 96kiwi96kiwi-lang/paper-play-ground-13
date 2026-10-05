import { expect, test } from "vitest";
import { accountRouteReason } from "@/lib/orders/account-route";

test("omitted, null, and blank account aliases pass", () => {
  expect(accountRouteReason(undefined)).toBeNull();
  expect(accountRouteReason(null, null, null)).toBeNull();
  expect(accountRouteReason("", "  ", "\t")).toBeNull();
});

test("present account aliases are refused and do not halt", () => {
  expect(accountRouteReason("margin")).toBe(
    "Account type is not supported; the adapter places on the spot trade account",
  );
  expect(accountRouteReason(undefined, "main")).toBe(
    "Account is not supported; the adapter places on the spot trade account",
  );
  expect(accountRouteReason(undefined, undefined, "trade")).toBe(
    "Funds account is not supported; the adapter places on the spot trade account",
  );
  expect(accountRouteReason(0)).toBe(
    "Account type is not supported; the adapter places on the spot trade account",
  );
});
