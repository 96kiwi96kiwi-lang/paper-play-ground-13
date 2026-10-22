import { expect, test } from "vitest";
import { submit } from "@/lib/orders/order-manager";

const plain = { symbol: "BTC-USDT", side: "buy" as const, amount: 1 };

test("plain submit still passes", () => {
  expect(submit(plain)).toEqual({ ok: true });
});

test("trailing fields are refused by submit and do not halt", () => {
  expect(submit({ ...plain, trailingStop: true })).toEqual({
    ok: false,
    reason: "Trailing stop is not supported; the adapter would place a plain spot order",
  });
  expect(submit({ ...plain, trailingStop: 0 })).toEqual({
    ok: false,
    reason: "Trailing stop is not supported; the adapter would place a plain spot order",
  });
  expect(submit({ ...plain, trailingDelta: 50 })).toEqual({
    ok: false,
    reason: "Trailing delta is not supported; the adapter would place a plain spot order",
  });
  expect(submit({ ...plain, callbackRate: 0.5 })).toEqual({
    ok: false,
    reason: "Callback rate is not supported; the adapter would place a plain spot order",
  });
  expect(submit({ ...plain, activationPrice: 100 })).toEqual({
    ok: false,
    reason: "Activation price is not supported; the adapter would place a plain spot order",
  });
});

test("exec-inst fields are refused by submit and do not halt", () => {
  expect(submit({ ...plain, execInst: "PostOnly" })).toEqual({
    ok: false,
    reason: "Execution instruction is not supported; the adapter would place a normal spot order",
  });
  expect(submit({ ...plain, execInstruction: 0 })).toEqual({
    ok: false,
    reason: "Execution-instruction alias is not supported; the adapter would place a normal spot order",
  });
  expect(submit({ ...plain, instruction: "ReduceOnly" })).toEqual({
    ok: false,
    reason: "Instruction is not supported; the adapter would place a normal spot order",
  });
});

test("omitted, blank, and false trailing and exec-inst fields pass", () => {
  expect(
    submit({ ...plain, trailingStop: false, trailingDelta: null, callbackRate: "", activationPrice: undefined }),
  ).toEqual({ ok: true });
  expect(submit({ ...plain, execInst: false, execInstruction: null, instruction: "" })).toEqual({ ok: true });
});
