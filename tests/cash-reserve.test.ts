import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { cashReserveBuyReason, workingBuyReservedUsd } from "@/lib/orders/cash-reserve";

const reserve = TRADING_CONFIG.risk.minCashReserveUsd;

test("sells skip the cash-reserve floor", () => {
  expect(cashReserveBuyReason("sell", 100, 10_000, reserve)).toBeNull();
});

test("buy that leaves cash below reserve is refused", () => {
  const reason = cashReserveBuyReason("buy", 600, 200, reserve);
  expect(reason).toMatch(/Cash reserve/i);
  expect(reason).toMatch(/breach/);
});

test("buy that keeps the reserve sleeve is allowed", () => {
  expect(cashReserveBuyReason("buy", 2_000, 200, reserve)).toBeNull();
});

test("buy with unknown notional is refused when book cash is already near the floor", () => {
  const reason = cashReserveBuyReason("buy", reserve + 5, undefined, reserve);
  expect(reason).toMatch(/Cash reserve floor/i);
});

test("working buy remaining notional is reserved against cash", () => {
  const reserved = workingBuyReservedUsd([
    { side: "buy", status: "open", amount: 1, filled: 0, remaining: 1, price: 400 },
    { side: "sell", status: "open", amount: 1, remaining: 1, price: 9_999 },
    { side: "buy", status: "filled", amount: 1, filled: 1, remaining: 0, price: 400 },
  ]);
  expect(reserved).toBe(400);
});

test("buy that looks fine on raw cash is refused when working buys already reserved the sleeve", () => {
  const reason = cashReserveBuyReason("buy", 2_000, 200, reserve, 1_400);
  expect(reason).toMatch(/reserved working buys/i);
});

test("buy still allowed when reserved working buys leave the sleeve intact", () => {
  expect(cashReserveBuyReason("buy", 2_000, 200, reserve, 200)).toBeNull();
});
