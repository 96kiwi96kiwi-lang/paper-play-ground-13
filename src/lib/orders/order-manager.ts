/**
 * Order manager — shared Paper + Live path.
 *
 * Lifecycle: create → validate (risk) → submit → track status → update portfolio.
 * Idempotency: clientOrderId is generated once per intent and reused on retry.
 * Seen IDs can be hydrated from server persist so a restart does not double-submit.
 */

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

export class OrderManager {
  private seen = new Map<string, UnifiedOrder>();
  private portfolio: PortfolioSnapshot;
  private eventsLog: OrderLifecycleEvent[] = [];
  private onPortfolioChange?: (portfolio: PortfolioSnapshot) => void;
  private onSeenOrdersChange?: (orders: UnifiedOrder[]) => void;

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

  hydrate(snapshot: PortfolioSnapshot) {
    this.portfolio = {
      cash: snapshot.cash,
      positions: { ...snapshot.positions },
    };
  }

  hydrateSeen(orders: UnifiedOrder[]) {
    for (const order of orders) {
      const key = order.clientOrderId || order.id;
      if (!key) continue;
      this.seen.set(key, order);
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
    this.seen.set(clientOrderId, order);
    this.onSeenOrdersChange?.(this.snapshotSeen());
    events.push({ stage: "submitted", order });

    if (order.status === "rejected") {
      const reason = order.rejectReason ?? "Exchange rejected order";
      events.push({ stage: "rejected", order, reason });
      this.eventsLog.push(...events);
      return { ok: false, order, reason, events, portfolio: this.getPortfolio() };
    }

    const filled = order.filled ?? 0;
    const remaining = order.remaining ?? Math.max(0, order.amount - filled);

    if (filled > 0 && remaining > 0) {
      events.push({ stage: "partial", order });
    }

    if (filled > 0) {
      this.applyFill(order);
      events.push({ stage: "portfolio_updated", portfolio: this.getPortfolio() });
    }

    if (remaining <= 0 || order.status === "closed") {
      events.push({ stage: "filled", order });
    }

    this.eventsLog.push(...events);
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
    if (latest.clientOrderId) this.seen.set(latest.clientOrderId, latest);
    this.onSeenOrdersChange?.(this.snapshotSeen());
    return latest;
  }

  private applyFill(order: UnifiedOrder) {
    const filled = order.filled;
    if (filled <= 0) return;
    const px = order.price ?? (order.cost && filled ? order.cost / filled : 0);
    const cost = order.cost || filled * px;

    if (order.side === "buy") {
      this.portfolio.cash = Math.max(0, this.portfolio.cash - cost);
      const existing = this.portfolio.positions[order.symbol];
      if (existing) {
        const totalAmt = existing.amount + filled;
        const totalCost = existing.amount * existing.avgEntry + cost;
        this.portfolio.positions[order.symbol] = {
          amount: totalAmt,
          avgEntry: totalAmt > 0 ? totalCost / totalAmt : px,
        };
      } else {
        this.portfolio.positions[order.symbol] = { amount: filled, avgEntry: px };
      }
    } else {
      this.portfolio.cash += cost;
      const existing = this.portfolio.positions[order.symbol];
      if (existing) {
        existing.amount -= filled;
        if (existing.amount <= 1e-8) delete this.portfolio.positions[order.symbol];
      }
    }

    this.onPortfolioChange?.(this.getPortfolio());
  }
}
