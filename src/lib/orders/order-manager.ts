/**
 * OrderManager — last gate before Paper or KuCoin adapters.
 * Floors refuse bad submits; they are not hard-stops and contain no secrets.
 */

import { TRADING_CONFIG } from "@/config/trading";
import type { ExchangeAdapter, Side, UnifiedOrder } from "@/lib/exchange/types";
import { applyHardStops, evaluateRisk, type RiskState } from "@/lib/risk";
import { excessAmountDecimalsReason } from "./amount-precision";
import { excessPriceDecimalsReason } from "./price-precision";
import { averageDownReason } from "./average-down";
import { cashReserveBuyReason, workingBuyReservedUsd } from "./cash-reserve";
import { crossMarkReason } from "./cross-mark";
import { chaseUpReason, lastAcceptedBuyFill } from "./chase-up";
import { duplicateClientOrderIdReason, invalidClientOrderIdReason } from "./client-order-id";
import { consecutiveBuysReason, trailingAcceptedBuys } from "./consecutive-buys";
import {
  acceptedBuyNotionalOnUtcDay,
  acceptedBuyNotionalOnUtcDayForSymbol,
  dailyBuyNotionalPerSymbolReason,
  dailyBuyNotionalReason,
} from "./daily-buy-notional";
import {
  acceptedTradeCountOnUtcDayForSymbol,
  dailyTradeCapPerSymbolReason,
} from "./daily-trade-cap";
import {
  acceptedBuyNotionalInWindow,
  acceptedBuyNotionalInWindowForSymbol,
  hourlyBuyNotionalPerSymbolReason,
  hourlyBuyNotionalReason,
} from "./hourly-buy-notional";
import {
  acceptedSellNotionalOnUtcDay,
  acceptedSellNotionalOnUtcDayForSymbol,
  dailySellNotionalPerSymbolReason,
  dailySellNotionalReason,
} from "./daily-sell-notional";
import {
  acceptedSellNotionalInWindow,
  acceptedSellNotionalInWindowForSymbol,
  hourlySellNotionalPerSymbolReason,
  hourlySellNotionalReason,
} from "./hourly-sell-notional";
import { inventoryReserveSellReason, workingSellReservedAmount } from "./inventory-reserve";
import { limitPriceBandReason } from "./limit-price-band";
import { lastLosingSellAt, lossReentryReason } from "./loss-reentry";
import { openSlotReason, openSlotSymbols } from "./open-slots";
import {
  rejectBurstPerSymbolReason,
  rejectBurstReason,
  rejectedCountInWindow,
  rejectedCountInWindowForSymbol,
} from "./reject-burst";
import { sameSideCooldownReason } from "./same-side-cooldown";
import { samePriceWorkingReason } from "./same-price";
import { rungSpacingReason } from "./rung-spacing";
import { selfCrossReason } from "./self-cross";
import { sellDustRemainderReason } from "./sell-dust";
import { selectStaleOpenOrders, selectWorkingOrders } from "./stale-open";
import { staleMarketQuoteReason } from "./stale-quote";
import { marketReferencePrice, unpricedMarketReason } from "./unpriced-market";
import { normalizeOrderType } from "./order-type";
import { normalizeTimeInForce } from "./time-in-force";
import { icebergReason } from "./iceberg";
import { postOnlyReason } from "./post-only";
import { reduceOnlyReason } from "./reduce-only";
import { stopPriceReason } from "./stop-price";
import { normalizeOrderSide } from "./side-form";
import { normalizePairSymbol } from "./symbol-form";
import { symbolFlipCooldownReason } from "./symbol-flip";
import {
  workingNotionalPerSymbolReason,
  workingNotionalReason,
  workingNotionalUsd,
  workingNotionalUsdForSymbol,
} from "./working-notional";

export type OrderIntent = {
  symbol: string;
  side: Side;
  amount: number;
  type?: "market" | "limit";
  price?: number;
  /** Mark used to band limits and to size a market that has no price. */
  markPrice?: number;
  quotedAt?: number;
  clientOrderId?: string;
  reason?: string;
  /** Resting policy. Omitted means GTC. IOC/FOK are refused before the adapter. */
  timeInForce?: string;
  /** Maker-only flag. Adapters do not forward it, so true is refused. */
  postOnly?: boolean;
  /** Close-only flag. Adapters do not forward it, so true is refused. */
  reduceOnly?: boolean;
  /** Trigger price. Adapters do not forward it, so a present value is refused. */
  stopPrice?: number;
  /** Display-size flag. Adapters do not forward it, so true is refused. */
  iceberg?: boolean;
  /** Hide-size flag. Adapters do not forward it, so true is refused. */
  hidden?: boolean;
  /** Shown slice. Adapters do not forward it, so a present value is refused. */
  visibleSize?: number;
};

export type SubmitResult =
  | { ok: true; order: UnifiedOrder; reason?: string }
  | { ok: false; reason: string; order?: UnifiedOrder };

export type PortfolioSnapshot = {
  cash: number;
  positions: Record<string, { amount: number; avgEntry: number }>;
};

export type OrderManagerOptions = {
  startingCash?: number;
  startingPositions?: Record<string, { amount: number; avgEntry: number }>;
  seenOrders?: UnifiedOrder[];
  lastSubmitAt?: number;
  onPortfolioChange?: (portfolio: PortfolioSnapshot) => void;
  onSeenOrdersChange?: (orders: UnifiedOrder[]) => void;
  onLastSubmitAtChange?: (at: number) => void;
};

const ALLOWED = new Set<string>(TRADING_CONFIG.pairs);

function isWorking(status: string): boolean {
  return status === "open" || status === "partially_filled" || status === "pending";
}

export class OrderManager {
  private cash: number;
  private positions: Record<string, { amount: number; avgEntry: number }>;
  private seen: UnifiedOrder[];
  private lastSubmitAt: number;
  private readonly onPortfolioChange?: OrderManagerOptions["onPortfolioChange"];
  private readonly onSeenOrdersChange?: OrderManagerOptions["onSeenOrdersChange"];
  private readonly onLastSubmitAtChange?: OrderManagerOptions["onLastSubmitAtChange"];

  constructor(
    private readonly adapter: ExchangeAdapter,
    options: OrderManagerOptions = {},
  ) {
    this.cash = options.startingCash ?? TRADING_CONFIG.paperStartingBalance;
    this.positions = { ...(options.startingPositions ?? {}) };
    this.seen = [...(options.seenOrders ?? [])];
    this.lastSubmitAt = options.lastSubmitAt ?? 0;
    this.onPortfolioChange = options.onPortfolioChange;
    this.onSeenOrdersChange = options.onSeenOrdersChange;
    this.onLastSubmitAtChange = options.onLastSubmitAtChange;
  }

  positionAmount(symbol: string): number {
    return this.positions[symbol]?.amount ?? 0;
  }

  snapshot(): PortfolioSnapshot {
    return { cash: this.cash, positions: { ...this.positions } };
  }

  seenOrders(): UnifiedOrder[] {
    return [...this.seen];
  }

  /**
   * Cancel resting working orders older than orders.staleOpenOrderMs.
   * Does not flatten positions. Adapter cancel failures are logged and skipped.
   */
  async cancelStaleOpenOrders(now = Date.now()): Promise<{ canceled: number; failed: number }> {
    const maxAge = TRADING_CONFIG.orders.staleOpenOrderMs;
    return this.cancelSelected(selectStaleOpenOrders(this.seen, now, maxAge));
  }

  /**
   * Cancel every working order (halt path). Does not flatten positions.
   */
  async cancelAllWorkingOrders(): Promise<{ canceled: number; failed: number }> {
    return this.cancelSelected(selectWorkingOrders(this.seen));
  }

  private async cancelSelected(
    selected: UnifiedOrder[],
  ): Promise<{ canceled: number; failed: number }> {
    let canceled = 0;
    let failed = 0;
    for (const order of selected) {
      try {
        await this.adapter.cancelOrder(order.id, order.symbol);
        this.remember({
          ...order,
          status: "canceled",
          remaining: order.remaining ?? Math.max(0, order.amount - (order.filled ?? 0)),
        });
        canceled += 1;
      } catch (err) {
        failed += 1;
        const msg = err instanceof Error ? err.message : String(err);
        console.info(`[orders] cancel failed ${order.id} ${order.symbol}: ${msg}`);
      }
    }
    return { canceled, failed };
  }

  async submit(intent: OrderIntent, riskState: RiskState): Promise<SubmitResult> {
    const now = Date.now();
    const cfg = TRADING_CONFIG.orders;

    const typed = normalizeOrderType(intent.type);
    if ("reason" in typed) return this.fail(typed.reason);
    const type = typed.type;
    intent = { ...intent, type };

    const tif = normalizeTimeInForce(intent.timeInForce);
    if ("reason" in tif) return this.fail(tif.reason);
    intent = { ...intent, timeInForce: tif.timeInForce };

    const postOnly = postOnlyReason(intent.postOnly);
    if (postOnly) return this.fail(postOnly);

    const reduceOnly = reduceOnlyReason(intent.reduceOnly);
    if (reduceOnly) return this.fail(reduceOnly);

    const stopPrice = stopPriceReason(intent.stopPrice);
    if (stopPrice) return this.fail(stopPrice);

    const iceberg = icebergReason(intent.iceberg, intent.visibleSize);
    if (iceberg) return this.fail(iceberg);
    const hidden = icebergReason(intent.hidden);
    if (hidden) return this.fail(hidden);

    applyHardStops(riskState);
    if (riskState.haltReason) {
      return this.fail(`Halted: ${riskState.haltReason}`);
    }

    const pair = normalizePairSymbol(intent.symbol, ALLOWED);
    if ("reason" in pair) return this.fail(pair.reason);
    intent = { ...intent, symbol: pair.symbol };

    const side = normalizeOrderSide(intent.side);
    if ("reason" in side) return this.fail(side.reason);
    intent = { ...intent, side: side.side };

    if (!(intent.amount > 0) || !Number.isFinite(intent.amount)) {
      return this.fail("Amount must be a positive finite number");
    }

    const fineAmount = excessAmountDecimalsReason(intent.amount, cfg.maxAmountDecimals);
    if (fineAmount) return this.fail(fineAmount);

    const finePrice = excessPriceDecimalsReason(type, intent.price, cfg.maxPriceDecimals);
    if (finePrice) return this.fail(finePrice);

    const badId = invalidClientOrderIdReason(intent.clientOrderId, cfg.maxClientOrderIdLength);
    if (badId) return this.fail(badId);

    const dup = duplicateClientOrderIdReason(intent.clientOrderId, this.seen);
    if (dup) return this.fail(dup);

    const stale = staleMarketQuoteReason(type, intent.quotedAt, now, cfg.maxPriceAgeMs);
    if (stale) return this.fail(stale);

    const band = limitPriceBandReason(
      type,
      intent.price,
      intent.markPrice,
      cfg.maxLimitDeviationPct,
    );
    if (band) return this.fail(band);

    const crossMark = crossMarkReason(
      type,
      intent.side,
      intent.symbol,
      intent.price,
      intent.markPrice,
      cfg.blockCrossMark,
    );
    if (crossMark) return this.fail(crossMark);

    const flip = symbolFlipCooldownReason(
      intent.symbol,
      intent.side,
      this.seen,
      now,
      cfg.symbolFlipCooldownMs,
    );
    if (flip) return this.fail(flip);

    const sameSide = sameSideCooldownReason(
      intent.symbol,
      intent.side,
      this.seen,
      now,
      cfg.sameSideCooldownMs,
    );
    if (sameSide) return this.fail(sameSide);

    const rejectBurst = rejectBurstReason(
      rejectedCountInWindow(this.seen, now, cfg.rejectBurstWindowMs),
      cfg.maxRejectsInWindow,
      cfg.rejectBurstWindowMs,
    );
    if (rejectBurst) return this.fail(rejectBurst);

    const rejectBurstSymbol = rejectBurstPerSymbolReason(
      intent.symbol,
      rejectedCountInWindowForSymbol(this.seen, intent.symbol, now, cfg.rejectBurstWindowMs),
      cfg.maxRejectsPerSymbolInWindow,
      cfg.rejectBurstWindowMs,
    );
    if (rejectBurstSymbol) return this.fail(rejectBurstSymbol);

    if (this.lastSubmitAt > 0 && now - this.lastSubmitAt < cfg.minSubmitIntervalMs) {
      return this.fail(
        `Burst cooldown: wait ${cfg.minSubmitIntervalMs - (now - this.lastSubmitAt)}ms`,
      );
    }

    const working = this.seen.filter((o) => isWorking(String(o.status)));
    if (working.length >= cfg.maxConcurrentOpenOrders) {
      return this.fail(
        `Working-order cap: ${working.length}/${cfg.maxConcurrentOpenOrders}`,
      );
    }
    const perSymbol = working.filter((o) => o.symbol === intent.symbol).length;
    if (perSymbol >= cfg.maxOpenOrdersPerSymbol) {
      return this.fail(
        `Per-symbol working-order cap: ${perSymbol}/${cfg.maxOpenOrdersPerSymbol} on ${intent.symbol}`,
      );
    }

    const cross = selfCrossReason(
      intent.side,
      intent.symbol,
      working,
      cfg.blockOppositeWorking,
    );
    if (cross) return this.fail(cross);

    const samePrice = samePriceWorkingReason(
      intent.side,
      intent.symbol,
      type === "limit" ? intent.price : undefined,
      working,
      cfg.samePriceBandPct,
      cfg.blockSamePriceWorking,
    );
    if (samePrice) return this.fail(samePrice);

    const rung = rungSpacingReason(
      intent.side,
      intent.symbol,
      type === "limit" ? intent.price : undefined,
      working,
      cfg.minRungSpacingPct,
      cfg.blockTightRung,
    );
    if (rung) return this.fail(rung);

    const slots = openSlotReason(
      intent.side,
      intent.symbol,
      openSlotSymbols(this.positions, working),
      TRADING_CONFIG.risk.maxOpenPositions,
    );
    if (slots) return this.fail(slots);

    const symbolDayTrades = acceptedTradeCountOnUtcDayForSymbol(this.seen, intent.symbol, now);
    const symbolTradeCap = dailyTradeCapPerSymbolReason(
      intent.symbol,
      symbolDayTrades,
      TRADING_CONFIG.risk.maxDailyTradesPerSymbol,
    );
    if (symbolTradeCap) return this.fail(symbolTradeCap);

    const buyLadder = consecutiveBuysReason(
      intent.side,
      intent.symbol,
      trailingAcceptedBuys(this.seen, intent.symbol),
      cfg.maxConsecutiveBuysPerSymbol,
    );
    if (buyLadder) return this.fail(buyLadder);

    const lossReentry = lossReentryReason(
      intent.side,
      intent.symbol,
      lastLosingSellAt(this.seen, intent.symbol, cfg.lossReentryMinLossPct),
      now,
      cfg.lossReentryCooldownMs,
    );
    if (lossReentry) return this.fail(lossReentry);

    const mark = intent.markPrice && intent.markPrice > 0 ? intent.markPrice : intent.price;
    const heldPos = this.positions[intent.symbol];
    const averageDown = averageDownReason(
      intent.side,
      intent.symbol,
      heldPos?.amount ?? 0,
      heldPos?.avgEntry ?? 0,
      mark,
      cfg.maxAverageDownPct,
    );
    if (averageDown) return this.fail(averageDown);

    const chaseUp = chaseUpReason(
      intent.side,
      intent.symbol,
      mark,
      lastAcceptedBuyFill(this.seen, intent.symbol),
      now,
      cfg.chaseUpWindowMs,
      cfg.maxChaseUpPct,
    );
    if (chaseUp) return this.fail(chaseUp);

    const unpriced = unpricedMarketReason(type, intent.price, intent.markPrice);
    if (unpriced) return this.fail(unpriced);

    const px = marketReferencePrice(type, intent.price, intent.markPrice);
    const notional = px != null ? intent.amount * px : undefined;
    if (px != null && notional != null) {
      if (notional > cfg.maxOrderNotionalUsd) {
        return this.fail(
          `Notional ${notional.toFixed(2)} exceeds max ${cfg.maxOrderNotionalUsd}`,
        );
      }
      if (notional < cfg.minOrderNotionalUsd) {
        return this.fail(
          `Notional ${notional.toFixed(2)} below min ${cfg.minOrderNotionalUsd}`,
        );
      }
      if (intent.side === "buy") {
        const booked = Object.values(this.positions).reduce(
          (sum, p) => sum + p.amount * p.avgEntry,
          0,
        );
        if (booked + notional > cfg.maxGrossExposureUsd) {
          return this.fail(
            `Gross exposure ${(booked + notional).toFixed(2)} exceeds max ${cfg.maxGrossExposureUsd}`,
          );
        }
        const held = this.positionAmount(intent.symbol);
        const nextCost = held * (this.positions[intent.symbol]?.avgEntry ?? px) + notional;
        const maxByPct = riskState.portfolioValue * TRADING_CONFIG.risk.maxPositionPct;
        if (riskState.portfolioValue > 0 && nextCost > maxByPct) {
          return this.fail(
            `maxPositionPct: ${intent.symbol} would be ${nextCost.toFixed(2)} > ${maxByPct.toFixed(2)}`,
          );
        }
      }
    }

    const sleeve = workingNotionalReason(
      workingNotionalUsd(working),
      notional,
      cfg.maxWorkingNotionalUsd,
    );
    if (sleeve) return this.fail(sleeve);

    const sleeveSymbol = workingNotionalPerSymbolReason(
      intent.symbol,
      workingNotionalUsdForSymbol(working, intent.symbol),
      notional,
      cfg.maxWorkingNotionalPerSymbolUsd,
    );
    if (sleeveSymbol) return this.fail(sleeveSymbol);

    const dailyBuy = dailyBuyNotionalReason(
      intent.side,
      notional,
      acceptedBuyNotionalOnUtcDay(this.seen, now),
      cfg.maxDailyBuyNotionalUsd,
    );
    if (dailyBuy) return this.fail(dailyBuy);

    const dailyBuySymbol = dailyBuyNotionalPerSymbolReason(
      intent.side,
      intent.symbol,
      notional,
      acceptedBuyNotionalOnUtcDayForSymbol(this.seen, intent.symbol, now),
      cfg.maxDailyBuyNotionalPerSymbolUsd,
    );
    if (dailyBuySymbol) return this.fail(dailyBuySymbol);

    const hourlyBuy = hourlyBuyNotionalReason(
      intent.side,
      notional,
      acceptedBuyNotionalInWindow(this.seen, now, cfg.hourlyBuyWindowMs),
      cfg.maxHourlyBuyNotionalUsd,
    );
    if (hourlyBuy) return this.fail(hourlyBuy);

    const hourlyBuySymbol = hourlyBuyNotionalPerSymbolReason(
      intent.side,
      intent.symbol,
      notional,
      acceptedBuyNotionalInWindowForSymbol(this.seen, intent.symbol, now, cfg.hourlyBuyWindowMs),
      cfg.maxHourlyBuyNotionalPerSymbolUsd,
    );
    if (hourlyBuySymbol) return this.fail(hourlyBuySymbol);

    const dailySell = dailySellNotionalReason(
      intent.side,
      notional,
      acceptedSellNotionalOnUtcDay(this.seen, now),
      cfg.maxDailySellNotionalUsd,
    );
    if (dailySell) return this.fail(dailySell);

    const dailySellSymbol = dailySellNotionalPerSymbolReason(
      intent.side,
      intent.symbol,
      notional,
      acceptedSellNotionalOnUtcDayForSymbol(this.seen, intent.symbol, now),
      cfg.maxDailySellNotionalPerSymbolUsd,
    );
    if (dailySellSymbol) return this.fail(dailySellSymbol);

    const hourlySell = hourlySellNotionalReason(
      intent.side,
      notional,
      acceptedSellNotionalInWindow(this.seen, now, cfg.hourlySellWindowMs),
      cfg.maxHourlySellNotionalUsd,
    );
    if (hourlySell) return this.fail(hourlySell);

    const hourlySellSymbol = hourlySellNotionalPerSymbolReason(
      intent.side,
      intent.symbol,
      notional,
      acceptedSellNotionalInWindowForSymbol(this.seen, intent.symbol, now, cfg.hourlySellWindowMs),
      cfg.maxHourlySellNotionalPerSymbolUsd,
    );
    if (hourlySellSymbol) return this.fail(hourlySellSymbol);

    const reserveReason = cashReserveBuyReason(
      intent.side,
      this.cash,
      notional,
      TRADING_CONFIG.risk.minCashReserveUsd,
      workingBuyReservedUsd(working),
    );
    if (reserveReason) return this.fail(reserveReason);

    if (intent.side === "sell") {
      const held = this.positionAmount(intent.symbol);
      const reservedSells = workingSellReservedAmount(intent.symbol, working);
      const inventoryReason = inventoryReserveSellReason(
        intent.side,
        held,
        intent.amount,
        reservedSells,
        intent.symbol,
      );
      if (inventoryReason) return this.fail(inventoryReason);
      const available = held - reservedSells;
      const dust = sellDustRemainderReason(
        intent.side,
        available,
        intent.amount,
        px,
        cfg.minOrderNotionalUsd,
      );
      if (dust) return this.fail(dust);
    }

    const risk = evaluateRisk(riskState, intent.side, intent.symbol);
    if (!risk.allowed) {
      return this.fail(risk.reason);
    }

    let order: UnifiedOrder;
    try {
      if (type === "limit") {
        if (!(intent.price && intent.price > 0)) {
          return this.fail("Limit submit requires a positive price");
        }
        order = await this.adapter.placeLimitOrder(
          intent.symbol,
          intent.side,
          intent.amount,
          intent.price,
          intent.clientOrderId,
        );
      } else {
        order = await this.adapter.placeMarketOrder(
          intent.symbol,
          intent.side,
          intent.amount,
          intent.clientOrderId,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return this.fail(`Adapter error: ${msg}`);
    }

    this.remember(order);
    this.lastSubmitAt = now;
    this.onLastSubmitAtChange?.(now);

    if (order.status === "rejected") {
      return { ok: false, reason: order.rejectReason ?? "Rejected by adapter", order };
    }

    this.applyFill(order);
    return { ok: true, order };
  }

  private fail(reason: string): SubmitResult {
    return { ok: false, reason };
  }

  private remember(order: UnifiedOrder): void {
    const idx = this.seen.findIndex((o) => o.id === order.id);
    if (idx >= 0) this.seen[idx] = order;
    else this.seen.push(order);
    if (this.seen.length > 200) this.seen = this.seen.slice(-200);
    this.onSeenOrdersChange?.(this.seenOrders());
  }

  private applyFill(order: UnifiedOrder): void {
    const filled = order.filled ?? 0;
    if (filled <= 0) return;
    const px = order.price && order.price > 0 ? order.price : 0;
    const cost = order.cost > 0 ? order.cost : filled * px;

    if (order.side === "buy") {
      this.cash = Math.max(0, this.cash - cost);
      const existing = this.positions[order.symbol];
      if (existing) {
        const total = existing.amount + filled;
        const basis = existing.amount * existing.avgEntry + cost;
        this.positions[order.symbol] = {
          amount: total,
          avgEntry: total > 0 ? basis / total : existing.avgEntry,
        };
      } else {
        this.positions[order.symbol] = { amount: filled, avgEntry: px };
      }
    } else {
      this.cash += cost;
      const existing = this.positions[order.symbol];
      if (existing) {
        existing.amount -= filled;
        if (existing.amount <= 1e-8) delete this.positions[order.symbol];
      }
    }
    this.onPortfolioChange?.(this.snapshot());
  }
}
