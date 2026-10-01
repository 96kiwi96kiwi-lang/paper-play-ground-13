/**
 * OrderManager — last gate before Paper or KuCoin adapters.
 * Floors refuse bad submits; they are not hard-stops and contain no secrets.
 */

import { TRADING_CONFIG } from "@/config/trading";
import type { ExchangeAdapter, Side, UnifiedOrder } from "@/lib/exchange/types";
import { applyHardStops, evaluateRisk, type RiskState } from "@/lib/risk";
import { cashReserveBuyReason, workingBuyReservedUsd } from "./cash-reserve";
import { duplicateClientOrderIdReason } from "./client-order-id";
import {
  acceptedBuyNotionalOnUtcDay,
  acceptedBuyNotionalOnUtcDayForSymbol,
  dailyBuyNotionalPerSymbolReason,
  dailyBuyNotionalReason,
} from "./daily-buy-notional";
import { inventoryReserveSellReason, workingSellReservedAmount } from "./inventory-reserve";
import { sellDustRemainderReason } from "./sell-dust";
import { selectStaleOpenOrders, selectWorkingOrders } from "./stale-open";
import { staleMarketQuoteReason } from "./stale-quote";
import { symbolFlipCooldownReason } from "./symbol-flip";

export type OrderIntent = {
  symbol: string;
  side: Side;
  amount: number;
  type?: "market" | "limit";
  price?: number;
  quotedAt?: number;
  clientOrderId?: string;
  reason?: string;
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
    const type = intent.type ?? "market";
    const cfg = TRADING_CONFIG.orders;

    applyHardStops(riskState);
    if (riskState.haltReason) {
      return this.fail(`Halted: ${riskState.haltReason}`);
    }

    if (!ALLOWED.has(intent.symbol)) {
      return this.fail(`Unsupported pair: ${intent.symbol}`);
    }

    if (!(intent.amount > 0) || !Number.isFinite(intent.amount)) {
      return this.fail("Amount must be a positive finite number");
    }

    const dup = duplicateClientOrderIdReason(intent.clientOrderId, this.seen);
    if (dup) return this.fail(dup);

    const stale = staleMarketQuoteReason(type, intent.quotedAt, now, cfg.maxPriceAgeMs);
    if (stale) return this.fail(stale);

    const flip = symbolFlipCooldownReason(
      intent.symbol,
      intent.side,
      this.seen,
      now,
      cfg.symbolFlipCooldownMs,
    );
    if (flip) return this.fail(flip);

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

    const px = intent.price && intent.price > 0 ? intent.price : undefined;
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
