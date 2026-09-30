import { afterEach, expect, test } from "vitest";
import {
  OPERATOR_AUTH_ERROR,
  assertOperatorConfigured,
  assertOperatorToken,
  operatorTokenConfigured,
} from "@/lib/server/operator-auth";

const ORIGINAL = process.env.OPERATOR_TOKEN;

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.OPERATOR_TOKEN;
  else process.env.OPERATOR_TOKEN = ORIGINAL;
});

test("missing OPERATOR_TOKEN fails closed", () => {
  delete process.env.OPERATOR_TOKEN;
  expect(operatorTokenConfigured()).toBe(false);
  expect(() => assertOperatorConfigured()).toThrow(OPERATOR_AUTH_ERROR);
  expect(() => assertOperatorToken("anything")).toThrow(OPERATOR_AUTH_ERROR);
});

test("wrong token fails with the same public error", () => {
  process.env.OPERATOR_TOKEN = "fixture-operator-token";
  expect(operatorTokenConfigured()).toBe(true);
  expect(() => assertOperatorToken("nope")).toThrow(OPERATOR_AUTH_ERROR);
  expect(() => assertOperatorToken("")).toThrow(OPERATOR_AUTH_ERROR);
});

test("matching token is accepted and never returned", () => {
  process.env.OPERATOR_TOKEN = "fixture-operator-token";
  expect(() => assertOperatorToken("fixture-operator-token")).not.toThrow();
  expect(() => assertOperatorToken(" fixture-operator-token ")).not.toThrow();
});
