/**
 * OrderManager – single gate for paper and live submits.
 * Applies hard-stops, notional/reserve/trade-cap floors, and metadata floors
 * (child/root/sibling/parent/payload/chain/group/link) before any adapter call.
 * Default path is paper. No secrets. No live without server-side keys.
 */

import { TRADING_CONFIG } from "@/config/trading";
import type { ExchangeAdapter, Side, UnifiedOrder } from "@/lib/exchange/types";
import type { RiskState } from "@/lib/risk";
import { orderChildReason } from "./order-child";
import { orderRootReason } from "./order-root";
import { orderSiblingReason } from "./order-sibling";
import { orderParentReason } from "./order-parent";
import { orderPayloadReason } from "./order-payload";
import { orderChainReason } from "./order-chain";
import { orderGroupReason } from "./order-group";
import { orderLinkReason } from "./order-link";

export interface OrderIntent {
  symbol: string;
  side: Side;
  amount: number;
  type?: "market" | "limit";
  price?: number;
  quotedAt?: number;
  reason?: string;
  clientOrderId?: string;
  // metadata floors (present values are refused)
  childId?: unknown;
  orderChild?: unknown;
  clientChild?: unknown;
  rootId?: unknown;
  orderRoot?: unknown;
  clientRoot?: unknown;
  siblingId?: unknown;
  orderSibling?: unknown;
  clientSibling?: unknown;
  parentId?: unknown;
  orderParent?: unknown;
  clientParent?: unknown;
  payload?: unknown;
  orderPayload?: unknown;
  clientPayload?: unknown;
  chainId?: unknown;
  orderChain?: unknown;
  clientChain?: unknown;
  group?: unknown;
  orderGroup?: unknown;
  clientGroup?: unknown;
  linkId?: unknown;
  orderLink?: unknown;
  clientLink?: unknown;
}

export interface SubmitResult {
  ok: boolean;
  reason?: string;
  order?: UnifiedOrder;
}

export interface PortfolioSnapshot {
  cash: number;
  positions: Record<string, { amount: number; avgEntry: number }>;
}

export interface OrderManagerOptions {
  startingCash?: number;
  startingPositions?: Record<string, { amount: number; avgEntry: number }>;
  seenOrders?: Set<string> | string[];
  lastSubmitAt?: number;
  onPortfolioChange?: (portfolio: PortfolioSnapshot) => void;
  onSeenOrdersChange?: (seen: string[]) => void;
  onLastSubmitAtChange?: (ts: number) => void;
}

export class OrderManager {
  private cash: number;
  private positions: Record<string, { amount: number; avgEntry: number }>;
  private seen = new Set<string>();
  private lastSubmitAt = 0;

  constructor(
    private adapter: ExchangeAdapter,
    opts: OrderManagerOptions = {},
  ) {
    this.cash = opts.startingCash ?? TRADING_CONFIG.paperStartingBalance;
    this.positions = { ...(opts.startingPositions ?? {}) };
    if (opts.seenOrders) {
      for (const id of opts.seenOrders) this.seen.add(id);
    }
    this.lastSubmitAt = opts.lastSubmitAt ?? 0;
  }

  positionAmount(symbol: string): number {
    return this.positions[symbol]?.amount ?? 0;
  }

  snapshot(): PortfolioSnapshot {
    return { cash: this.cash, positions: { ...this.positions } };
  }

  async cancelStaleOpenOrders(): Promise<void> {
    // Stale-open floor lives in adapter / separate module; no-op here keeps the call site safe.
    // Full cancel path can be wired in a later hour without changing this signature.
  }

  private refuse(reason: string): SubmitResult {
    return { ok: false, reason };
  }

  private notifyPortfolio(opts: OrderManagerOptions) {
    opts.onPortfolioChange?.(this.snapshot());
  }

  async submit(intent: OrderIntent, riskState: RiskState): Promise<SubmitResult> {
    if (riskState.haltReason) {
      return this.refuse(`Hard-stop active: ${riskState.haltReason}`);
    }

    // Metadata floors – refuse unsupported parent/child/root/sibling/payload/chain/group/link intent
    const child = orderChildReason(intent.childId, intent.orderChild, intent.clientChild);
    if (child) return this.refuse(child);
    const root = orderRootReason(intent.rootId, intent.orderRoot, intent.clientRoot);
    if (root) return this.refuse(root);
    const sibling = orderSiblingReason(intent.siblingId, intent.orderSibling, intent.clientSibling);
    if (sibling) return this.refuse(sibling);
    const parent = orderParentReason(intent.parentId, intent.orderParent, intent.clientParent);
    if (parent) return this.refuse(parent);
    const payload = orderPayloadReason(intent.payload, intent.orderPayload, intent.clientPayload);
    if (payload) return this.refuse(payload);
    const chain = orderChainReason(intent.chainId, intent.orderChain, intent.clientChain);
    if (chain) return this.refuse(chain);
    const group = orderGroupReason(intent.group, intent.orderGroup, intent.clientGroup);
    if (group) return this.refuse(group);
    const link = orderLinkReason(intent.linkId, intent.orderLink, intent.clientLink);
    if (link) return this.refuse(link);

    if (!TRADING_CONFIG.pairs.includes(intent.symbol as never)) {
      return this.refuse(`Unsupported symbol ${intent.symbol}`);
    }
    if (!(intent.amount > 0)) {
      return this.refuse("Amount must be positive");
    }

    const price = intent.price ?? 0;
    const notional = intent.amount * (price > 0 ? price : 1);
    const orders = TRADING_CONFIG.orders;
    if (notional > orders.maxOrderNotionalUsd) {
      return this.refuse(`Notional ${notional.toFixed(2)} exceeds maxOrderNotionalUsd`);
    }
    if (price > 0 && notional < orders.minOrderNotionalUsd) {
      return this.refuse(`Notional ${notional.toFixed(2)} below minOrderNotionalUsd`);
    }

    if (intent.side === "buy") {
      const reserve = TRADING_CONFIG.risk.minCashReserveUsd;
      if (this.cash - notional < reserve) {
        return this.refuse("Buy would breach minCashReserveUsd");
      }
    } else {
      const held = this.positionAmount(intent.symbol);
      if (intent.amount > held + 1e-8) {
        return this.refuse(`Sell exceeds inventory (${held})`);
      }
    }

    // Daily trade cap (refuse, not halt)
    const dayKey = new Date().toISOString().slice(0, 10);
    if (riskState.tradesDayKey === dayKey && (riskState.tradesToday ?? 0) >= TRADING_CONFIG.risk.maxDailyTrades) {
      return this.refuse("Daily trade cap reached");
    }

    try {
      const type = intent.type ?? "market";
      let order: UnifiedOrder;
      if (type === "limit" && intent.price) {
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

      if (order.status === "rejected" || order.rejectReason) {
        return { ok: false, reason: order.rejectReason ?? "Adapter rejected", order };
      }

      // Update internal paper book (live still tracks a shadow book for positionAmount)
      if (intent.side === "buy") {
        this.cash -= notional;
        const existing = this.positions[intent.symbol];
        if (existing) {
          const totalAmt = existing.amount + intent.amount;
          const totalCost = existing.amount * existing.avgEntry + notional;
          this.positions[intent.symbol] = { amount: totalAmt, avgEntry: totalCost / totalAmt };
        } else {
          this.positions[intent.symbol] = { amount: intent.amount, avgEntry: price || notional / intent.amount };
        }
      } else {
        this.cash += notional;
        const existing = this.positions[intent.symbol];
        if (existing) {
          const left = existing.amount - intent.amount;
          if (left <= 1e-8) delete this.positions[intent.symbol];
          else this.positions[intent.symbol] = { amount: left, avgEntry: existing.avgEntry };
        }
      }

      if (intent.clientOrderId) this.seen.add(intent.clientOrderId);
      this.lastSubmitAt = Date.now();
      return { ok: true, order };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return this.refuse(`Adapter error: ${msg}`);
    }
  }
}
