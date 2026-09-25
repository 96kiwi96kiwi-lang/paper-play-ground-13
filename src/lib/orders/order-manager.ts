/**
 * Order manager — shared Paper + Live path.
 *
 * Lifecycle: create → validate (risk) → submit → track status → update portfolio.
 * Idempotency: clientOrderId is generated once per intent and reused on retry.
 * Seen IDs can be hydrated from server persist so a restart does not double-submit.
 * Incremental fills: only the delta vs last applied filled amount hits the book.
 * Stale open orders: resting limits older than TTL are canceled (no fill unwind).
 * Burst guard: a second submit inside minSubmitIntervalMs is rejected (not persisted as seen).
 */

import { TRADING_CONFIG } from "@/config/trading";
import { evaluateRisk, type RiskState } from "@/lib/risk";
import type {
  ExchangeAdapter,
  Side,
  UnifiedOrder,
} from "@/lib/exchange/types";

export type PortfolioSnapshot = {
  cash: number;
  positions: Record<string, { amount: number; avgEntry: number }>;
};

export type ManagedOrderIntent = {
  symbol: string;
  side: Side;
  amount: number;
  type?: "market" | "limit";
  price?: number;
  clientOrderId?: string;
  reason?: string;
};

export type OrderLifecycleEvent =
  | { stage: "created"; intent: ManagedOrderIntent }
  | { stage: "validated"; allowed: boolean; reason: string; suggestedSizeUsd?: number }
  | { stage: "submitted"; order: UnifiedOrder }
  | { stage: "rejected"; order?: UnifiedOrder; reason: string }
  | { stage: "partial"; order: UnifiedOrder }
  | { stage: "filled"; order: UnifiedOrder }
  | { stage: "synced"; order: UnifiedOrder }
  | { stage: "canceled"; order: UnifiedOrder; reason: string }
  | { stage: "portfolio_updated"; portfolio: PortfolioSnapshot };

export interface SubmitResult {
  ok: boolean;
  order?: UnifiedOrder;
  reason: string;
  events: OrderLifecycleEvent[];
  portfolio?: PortfolioSnapshot;
}

export type OrderManagerOptions = {
  startingCash?: number;
  startingPositions?: PortfolioSnapshot["positions"];
  /** Optional hook so a server host can persist paper state without importing fs here. */
  onPortfolioChange?: (portfolio: PortfolioSnapshot) => void;
  /** Optional hook after a new clientOrderId is recorded. */
  onSeenOrdersChange?: (orders: UnifiedOrder[]) => void;
  seenOrders?: UnifiedOrder[];
  lastSubmitAt?: number;
};

function newClientOrderId(intent: ManagedOrderIntent): string {
  const raw = `${intent.symbol}|${intent.side}|${intent.amount}|${intent.type ?? "market"}|${intent.price ?? ""}`;
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `cid_${stamp}_${rand}_${hashLite(raw)}`;
}

function hashLite(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function keyOf(order: UnifiedOrder): string {
  return order.clientOrderId || order.id;
}

function isWorkingStatus(status: string): boolean {
  return status === "open" || status === "partially_filled" || status === "pending";
}

export class OrderManager {
  private seen = new Map<string, UnifiedOrder>();
  /** How much of each order has already been booked locally. */
  private appliedFilled = new Map<string, number>();
  private portfolio: PortfolioSnapshot;
  private eventsLog: OrderLifecycleEvent[] = [];
  private onPortfolioChange?: (portfolio: PortfolioSnapshot) => void;
  private onSeenOrdersChange?: (orders: UnifiedOrder[]) => void;
  private lastSubmitAt = 0;

  constructor(
    private adapter: ExchangeAdapter,
    startingCashOrOptions: number | OrderManagerOptions = 10_000,
    startingPositions: PortfolioSnapshot["positions"] = {},
  ) {
    if (typeof startingCashOrOptions === "number") {
      this.portfolio = {
        cash: startingCashOrOptions,
        positions: { ...startingPositions },
      };
    } else {
      this.portfolio = {
        cash: startingCashOrOptions.startingCash ?? 10_000,
        positions: { ...(startingCashOrOptions.startingPositions ?? startingPositions) },
      };
      this.onPortfolioChange = startingCashOrOptions.onPortfolioChange;
      this.onSeenOrdersChange = startingCashOrOptions.onSeenOrdersChange;
      this.lastSubmitAt = startingCashOrOptions.lastSubmitAt ?? 0;
      if (startingCashOrOptions.seenOrders) {
        this.hydrateSeen(startingCashOrOptions.seenOrders);
      }
    }
  }

  getAdapterName() {
    return this.adapter.name;
  }

  getPortfolio(): PortfolioSnapshot {
    return {
      cash: this.portfolio.cash,
      positions: { ...this.portfolio.positions },
    };
  }

  getLastSubmitAt() {
    return this.lastSubmitAt;
  }

  hydrate(snapshot: PortfolioSnapshot) {
    this.portfolio = {
      cash: snapshot.cash,
      positions: { ...snapshot.positions },
    };
  }

  hydrateSeen(orders: UnifiedOrder[]) {
    for (const order of orders) {
      const key = keyOf(order);
      if (!key) continue;
      this.seen.set(key, order);
      // Treat persisted filled qty as already booked so a restart does not double-apply.
      this.appliedFilled.set(key, order.filled ?? 0);
    }
  }

  snapshotSeen(): UnifiedOrder[] {
    return [...this.seen.values()];
  }

  getEvents() {
    return [...this.eventsLog];
  }

  /**
   * Create → risk-validate → submit on the bound adapter (Paper or KuCoin).
   */
  async submit(intent: ManagedOrderIntent, riskState: RiskState): Promise<SubmitResult> {
    const events: OrderLifecycleEvent[] = [];
    const clientOrderId = intent.clientOrderId ?? newClientOrderId(intent);
    const normalized: ManagedOrderIntent = { ...intent, clientOrderId, type: intent.type ?? "market" };

    events.push({ stage: "created", intent: normalized });

    if (this.seen.has(clientOrderId)) {
      const existing = this.seen.get(clientOrderId)!;
      events.push({ stage: existing.status === "rejected" ? "rejected" : "submitted", order: existing, reason: "Idempotent replay" } as OrderLifecycleEvent);
      return {
        ok: existing.status !== "rejected",
        order: existing,
        reason: "Idempotent replay of clientOrderId",
        events,
        portfolio: this.getPortfolio(),
      };
    }

    const risk = evaluateRisk(riskState, normalized.side, normalized.symbol);
    events.push({
      stage: "validated",
      allowed: risk.allowed,
      reason: risk.reason,
      suggestedSizeUsd: risk.suggestedSizeUsd,
    });

    if (!risk.allowed) {
      events.push({ stage: "rejected", reason: risk.reason });
      this.eventsLog.push(...events);
      return { ok: false, reason: risk.reason, events, portfolio: this.getPortfolio() };
    }

    const minInterval = TRADING_CONFIG.orders.minSubmitIntervalMs;
    const elapsed = Date.now() - this.lastSubmitAt;
    if (this.lastSubmitAt > 0 && elapsed < minInterval) {
      const reason = `Submit cooldown: wait ${minInterval - elapsed}ms (min ${minInterval}ms between accepted orders)`;
      events.push({ stage: "rejected", reason });
      this.eventsLog.push(...events);
      return { ok: false, reason, events, portfolio: this.getPortfolio() };
    }

    let order: UnifiedOrder;
    try {
      if (normalized.type === "limit" && normalized.price != null) {
        order = await this.adapter.placeLimitOrder(
          normalized.symbol,
          normalized.side,
          normalized.amount,
          normalized.price,
          clientOrderId,
        );
      } else {
        order = await this.adapter.placeMarketOrder(
          normalized.symbol,
          normalized.side,
          normalized.amount,
          clientOrderId,
        );
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Submit failed";
      events.push({ stage: "rejected", reason });
      this.eventsLog.push(...events);
      return { ok: false, reason, events, portfolio: this.getPortfolio() };
    }

    if (!order.clientOrderId) order.clientOrderId = clientOrderId;
    this.remember(order);
    events.push({ stage: "submitted", order });

    if (order.status === "rejected") {
      const reason = order.rejectReason ?? "Exchange rejected order";
      events.push({ stage: "rejected", order, reason });
      this.eventsLog.push(...events);
      return { ok: false, order, reason, events, portfolio: this.getPortfolio() };
    }

    this.lastSubmitAt = Date.now();
    this.applyIncrementalFill(order, events);

    this.eventsLog.push(...events);
    const filled = order.filled ?? 0;
    const remaining = order.remaining ?? Math.max(0, order.amount - filled);
    return {
      ok: filled > 0 || order.status === "open" || order.status === "partially_filled",
      order,
      reason: remaining > 0 && filled > 0 ? "Partial fill accepted" : "Order accepted",
      events,
      portfolio: this.getPortfolio(),
    };
  }

  async refresh(orderId: string, symbol: string): Promise<UnifiedOrder | null> {
    if (!this.adapter.fetchOrder) return null;
    const latest = await this.adapter.fetchOrder(orderId, symbol);
    if (!latest) return null;
    this.ingestRemoteOrder(latest);
    return latest;
  }

  /**
   * Poll open / in-flight orders and book only new fill deltas.
   * Same path for Paper (no-op if nothing open) and KuCoin.
   */
  async syncOpenOrders(symbol?: string): Promise<UnifiedOrder[]> {
    const events: OrderLifecycleEvent[] = [];
    const updated: UnifiedOrder[] = [];

    let remoteOpen: UnifiedOrder[] = [];
    try {
      remoteOpen = await this.adapter.fetchOpenOrders(symbol);
    } catch (err) {
      console.warn("[orders] fetchOpenOrders failed", err);
    }

    const pendingLocal = [...this.seen.values()].filter((o) => isWorkingStatus(String(o.status)));

    const byId = new Map<string, UnifiedOrder>();
    for (const o of remoteOpen) byId.set(o.id, o);
    for (const o of pendingLocal) {
      if (!byId.has(o.id) && this.adapter.fetchOrder) {
        try {
          const latest = await this.adapter.fetchOrder(o.id, o.symbol);
          if (latest) byId.set(latest.id, latest);
        } catch {
          /* keep last known snapshot */
        }
      }
    }

    for (const latest of byId.values()) {
      const applied = this.ingestRemoteOrder(latest);
      updated.push(latest);
      events.push({ stage: "synced", order: latest });
      if (applied) {
        events.push({ stage: "portfolio_updated", portfolio: this.getPortfolio() });
      }
    }

    this.eventsLog.push(...events);
    return updated;
  }

  /**
   * Cancel resting orders older than `maxAgeMs` (default from TRADING_CONFIG).
   * Market orders that already filled are ignored. Partial fills already booked stay booked.
   */
  async cancelStaleOpenOrders(
    maxAgeMs: number = TRADING_CONFIG.orders.staleOpenOrderMs,
    now = Date.now(),
  ): Promise<UnifiedOrder[]> {
    const canceled: UnifiedOrder[] = [];
    const events: OrderLifecycleEvent[] = [];

    let remoteOpen: UnifiedOrder[] = [];
    try {
      remoteOpen = await this.adapter.fetchOpenOrders();
    } catch (err) {
      console.warn("[orders] fetchOpenOrders failed during stale sweep", err);
    }

    const candidates = new Map<string, UnifiedOrder>();
    for (const o of remoteOpen) candidates.set(o.id, o);
    for (const o of this.seen.values()) {
      if (isWorkingStatus(String(o.status)) && !candidates.has(o.id)) {
        candidates.set(o.id, o);
      }
    }

    for (const order of candidates.values()) {
      if (order.type === "market" && (order.filled ?? 0) >= order.amount) continue;
      const age = now - (order.timestamp || 0);
      if (!order.timestamp || age < maxAgeMs) continue;
      if (!isWorkingStatus(String(order.status))) continue;

      try {
        await this.adapter.cancelOrder(order.id, order.symbol);
        const next: UnifiedOrder = {
          ...order,
          status: "canceled",
          remaining: order.remaining ?? Math.max(0, order.amount - (order.filled ?? 0)),
        };
        this.remember(next);
        events.push({
          stage: "canceled",
          order: next,
          reason: `Stale open order canceled after ${age}ms`,
        });
        canceled.push(next);
        console.info(
          `[orders] canceled stale ${order.type} ${order.side} ${order.symbol} id=${order.id} ageMs=${age}`,
        );
      } catch (err) {
        console.warn("[orders] cancel stale failed", order.id, err);
      }
    }

    this.eventsLog.push(...events);
    return canceled;
  }

  private ingestRemoteOrder(latest: UnifiedOrder): boolean {
    const known = [...this.seen.values()].find((o) => o.id === latest.id);
    if (known?.clientOrderId && !latest.clientOrderId) {
      latest.clientOrderId = known.clientOrderId;
    }
    this.remember(latest);
    const events: OrderLifecycleEvent[] = [];
    const applied = this.applyIncrementalFill(latest, events);
    this.eventsLog.push(...events);
    return applied;
  }

  private remember(order: UnifiedOrder) {
    const key = keyOf(order);
    if (!key) return;
    this.seen.set(key, order);
    this.onSeenOrdersChange?.(this.snapshotSeen());
  }

  /** Book only the unapplied slice of filled quantity. Returns true if book changed. */
  private applyIncrementalFill(order: UnifiedOrder, events: OrderLifecycleEvent[]): boolean {
    const key = keyOf(order);
    const filled = order.filled ?? 0;
    const remaining = order.remaining ?? Math.max(0, order.amount - filled);
    const already = this.appliedFilled.get(key) ?? 0;
    const delta = Math.max(0, filled - already);

    if (filled > 0 && remaining > 0) {
      events.push({ stage: "partial", order });
    }

    if (delta > 0) {
      this.applyFillDelta(order, delta);
      this.appliedFilled.set(key, already + delta);
      events.push({ stage: "portfolio_updated", portfolio: this.getPortfolio() });
    } else if (!this.appliedFilled.has(key)) {
      this.appliedFilled.set(key, filled);
    }

    if (remaining <= 0 || order.status === "closed" || order.status === "canceled") {
      if (order.status === "closed" || remaining <= 0) {
        events.push({ stage: "filled", order });
      }
    }

    return delta > 0;
  }

  private applyFillDelta(order: UnifiedOrder, filledDelta: number) {
    if (filledDelta <= 0) return;
    const px = order.price ?? (order.cost && order.filled ? order.cost / order.filled : 0);
    const cost = filledDelta * px;

    if (order.side === "buy") {
      this.portfolio.cash = Math.max(0, this.portfolio.cash - cost);
      const existing = this.portfolio.positions[order.symbol];
      if (existing) {
        const totalAmt = existing.amount + filledDelta;
        const totalCost = existing.amount * existing.avgEntry + cost;
        this.portfolio.positions[order.symbol] = {
          amount: totalAmt,
          avgEntry: totalAmt > 0 ? totalCost / totalAmt : px,
        };
      } else {
        this.portfolio.positions[order.symbol] = { amount: filledDelta, avgEntry: px };
      }
    } else {
      this.portfolio.cash += cost;
      const existing = this.portfolio.positions[order.symbol];
      if (existing) {
        existing.amount -= filledDelta;
        if (existing.amount <= 1e-8) delete this.portfolio.positions[order.symbol];
      }
    }

    this.onPortfolioChange?.(this.getPortfolio());
  }
}
