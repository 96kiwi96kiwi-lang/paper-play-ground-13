import { expect, test } from "vitest";
import { credentialBodyReason } from "@/lib/orders/credential-body";

test("omitted, null, and blank credential fields pass", () => {
  expect(credentialBodyReason(undefined)).toBeNull();
  expect(credentialBodyReason(null, null, null, null, null)).toBeNull();
  expect(credentialBodyReason("", "  ", "\t", "", " ")).toBeNull();
});

test("present credential fields are refused and do not halt", () => {
  expect(credentialBodyReason("kucoin-key")).toBe(
    "API key is not supported; credentials stay in server environment",
  );
  expect(credentialBodyReason(undefined, "sekrit")).toBe(
    "API secret is not supported; credentials stay in server environment",
  );
  expect(credentialBodyReason(undefined, undefined, "sekrit")).toBe(
    "Secret is not supported; credentials stay in server environment",
  );
  expect(credentialBodyReason(undefined, undefined, undefined, "phrase")).toBe(
    "Passphrase is not supported; credentials stay in server environment",
  );
  expect(credentialBodyReason(undefined, undefined, undefined, undefined, "sig")).toBe(
    "Signature is not supported; the server signs requests",
  );
  expect(credentialBodyReason(0)).toBe(
    "API key is not supported; credentials stay in server environment",
  );
});
