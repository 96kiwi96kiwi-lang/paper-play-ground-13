/**
 * OrderManager – single path from bot/strategy to Paper or KuCoin adapter.
 * Default is always paper. Live keys stay server-side only.
 *
 * Metadata floors (priority, note, etc.) refuse before the adapter and do not
 * burn maxRejectsInWindow. Not a halt; does not flatten positions.
 */

import { TRADING_CONFIG } from "@/config/trading";
import type { ExchangeAdapter, Side, UnifiedOrder } from "@/lib/exchange/types";
import type { RiskState } from "@/lib/risk";
import { orderNoteReason } from "./order-note";
import { orderPriorityReason } from "./order-priority";

export interface OrderIntent {
  symbol: string;
  side: Side;
  amount: number;
  type?: "market" | "limit";
  price?: number;
  clientOrderId?: string;
  quotedAt?: number;
  reason?: string;
  /** Metadata floors — present values are refused. */
  priority?: unknown;
  orderPriority?: unknown;
  timePriority?: unknown;
  note?: unknown;
  orderNote?: unknown;
  clientNote?: unknown;
}

export interface SubmitResult {
  ok: boolean;
  order?: UnifiedOrder;
  reason?: string;
}

export class OrderManager {
  constructor(private readonly adapter: ExchangeAdapter) {}

  /** Best-effort inventory from paper adapter; live returns 0 until synced. */
  positionAmount(symbol: string): number {
    if (this.adapter.name === "paper") {
      const positions = (this.adapter as { getPositions?: () => Record<string, { amount: number }> }).getPositions?.();
      return positions?.[symbol]?.amount ?? 0;
    }
    return 0;
  }

  /** Paper fills immediately; no-op for stale limits. Live would cancel old open orders. */
  async cancelStaleOpenOrders(): Promise<void> {
    // Paper has no resting limits. Live cancel of stale orders is a future hour.
  }

  /**
   * Submit an order. Priority and note floors run first so a refuse does not count as an adapter reject.
   */
  async submit(intent: OrderIntent, _riskState?: RiskState): Promise<SubmitResult> {
    const priorityRefuse = orderPriorityReason(
      intent.priority,
      intent.orderPriority,
      intent.timePriority,
    );
    if (priorityRefuse) {
      return { ok: false, reason: priorityRefuse };
    }

    const noteRefuse = orderNoteReason(
      intent.note,
      intent.orderNote,
      intent.clientNote,
    );
    if (noteRefuse) {
      return { ok: false, reason: noteRefuse };
    }

    if (!TRADING_CONFIG.pairs.includes(intent.symbol as (typeof TRADING_CONFIG.pairs)[number])) {
      return { ok: false, reason: `Symbol ${intent.symbol} is not in the allowed pairs` };
    }

    if (intent.amount <= 0) {
      return { ok: false, reason: "Amount must be positive" };
    }

    const type = intent.type ?? "market";

    try {
      let order: UnifiedOrder;
      if (type === "limit") {
        if (intent.price == null || intent.price <= 0) {
          return { ok: false, reason: "Limit order requires a positive price" };
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

      const rejected = order.status === "rejected";
      return {
        ok: !rejected,
        order,
        reason: rejected ? order.rejectReason : undefined,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Adapter error";
      return { ok: false, reason: message };
    }
  }
}
