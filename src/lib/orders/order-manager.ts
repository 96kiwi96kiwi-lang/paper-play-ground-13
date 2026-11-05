/**
 * OrderManager — single gate for every submit (paper or live).
 *
 * - Never holds API keys; the adapter is injected.
 * - Applies hard-stop / cash-reserve / daily-cap style checks before the adapter.
 * - Rejects unsupported amount aliases (positions, portfolio, equity, nav, assets, holdings, …)
 *   and order-header / order-footer / order-annotation / order-attribution / order-audience / order-batch / order-body / order-caption / order-note / order-comment / order-context / order-description / order-digest / order-expiry / order-hash / order-memo / order-message / order-metadata / order-name / order-priority / order-tag / order-label / order-source / order-span / order-trace / order-group / order-reference / order-remark / order-signature / order-subject / order-title / order-uuid metadata so a mistaken field cannot be silently ignored.
 * - Maintains a local paper book used by the bot and persistence layer.
 * - Live path still goes through the same method; keys stay on the server.
 */

import { TRADING_CONFIG } from "@/config/trading";
import type { ExchangeAdapter, UnifiedOrder, Side } from "@/lib/exchange/types";
import type { RiskState } from "@/lib/risk";
import { applyHardStops } from "@/lib/risk";
import { cashReserveBuyReason, workingBuyReservedUsd } from "./cash-reserve";
import { acceptedTradeCountOnUtcDay, dailyTradeCapPerSymbolReason } from "./daily-trade-cap";
import { excessAmountDecimalsReason } from "./amount-precision";
import { positionsAliasReason } from "./positions-alias";
import { portfolioAliasReason } from "./portfolio-alias";
import { equityAliasReason } from "./equity-alias";
import { navAliasReason } from "./nav-alias";
import { assetsAliasReason } from "./assets-alias";
import { holdingsAliasReason } from "./holdings-alias";
import { orderHeaderReason } from "./order-header";
import { orderFooterReason } from "./order-footer";
import { orderAnnotationReason } from "./order-annotation";
import { orderAttributionReason } from "./order-attribution";
import { orderAudienceReason } from "./order-audience";
import { orderBatchReason } from "./order-batch";
import { orderBodyReason } from "./order-body";
import { orderCaptionReason } from "./order-caption";
import { orderNoteReason } from "./order-note";
import { orderCommentReason } from "./order-comment";
import { orderContextReason } from "./order-context";
import { orderDescriptionReason } from "./order-description";
import { orderDigestReason } from "./order-digest";
import { orderExpiryReason } from "./order-expiry";
import { orderHashReason } from "./order-hash";
import { orderMemoReason } from "./order-memo";
import { orderMessageReason } from "./order-message";
import { orderMetadataReason } from "./order-metadata";
import { orderNameReason } from "./order-name";
import { orderPriorityReason } from "./order-priority";
import { orderTagReason } from "./order-tag";
import { orderLabelReason } from "./order-label";
import { orderSourceReason } from "./order-source";
import { orderSpanReason } from "./order-span";
import { orderTraceReason } from "./order-trace";
import { orderGroupReason } from "./order-group";
import { orderReferenceReason } from "./order-reference";
import { orderRemarkReason } from "./order-remark";
import { orderSignatureReason } from "./order-signature";
import { orderSubjectReason } from "./order-subject";
import { orderTitleReason } from "./order-title";
import { orderUuidReason } from "./order-uuid";

export interface OrderIntent {
  symbol: string;
  side: Side;
  amount: number;
  type?: "market" | "limit";
  price?: number;
  clientOrderId?: string;
  quotedAt?: number;
  reason?: string;
  // Unsupported aliases deliberately typed so the contract test can probe them.
  positions?: unknown;
  orderPositions?: unknown;
  basePositions?: unknown;
  portfolio?: unknown;
  orderPortfolio?: unknown;
  basePortfolio?: unknown;
  equity?: unknown;
  orderEquity?: unknown;
  baseEquity?: unknown;
  nav?: unknown;
  orderNav?: unknown;
  baseNav?: unknown;
  assets?: unknown;
  orderAssets?: unknown;
  baseAssets?: unknown;
  holdings?: unknown;
  orderHoldings?: unknown;
  baseHoldings?: unknown;
  header?: unknown;
  orderHeader?: unknown;
  clientHeader?: unknown;
  footer?: unknown;
  orderFooter?: unknown;
  clientFooter?: unknown;
  annotation?: unknown;
  orderAnnotation?: unknown;
  clientAnnotation?: unknown;
  attribution?: unknown;
  orderAttribution?: unknown;
  clientAttribution?: unknown;
  audience?: unknown;
  orderAudience?: unknown;
  clientAudience?: unknown;
  batch?: unknown;
  orderBatch?: unknown;
  clientBatch?: unknown;
  body?: unknown;
  orderBody?: unknown;
  clientBody?: unknown;
  caption?: unknown;
  orderCaption?: unknown;
  clientCaption?: unknown;
  note?: unknown;
  orderNote?: unknown;
  clientNote?: unknown;
  comment?: unknown;
  orderComment?: unknown;
  clientComment?: unknown;
  context?: unknown;
  orderContext?: unknown;
  clientContext?: unknown;
  description?: unknown;
  orderDescription?: unknown;
  clientDescription?: unknown;
  digest?: unknown;
  orderDigest?: unknown;
  clientDigest?: unknown;
  cancelAfter?: unknown;
  expireTime?: unknown;
  goodTillDate?: unknown;
  hash?: unknown;
  orderHash?: unknown;
  clientHash?: unknown;
  memo?: unknown;
  orderMemo?: unknown;
  clientMemo?: unknown;
  message?: unknown;
  orderMessage?: unknown;
  clientMessage?: unknown;
  metadata?: unknown;
  orderMetadata?: unknown;
  clientMetadata?: unknown;
  name?: unknown;
  orderName?: unknown;
  clientName?: unknown;
  priority?: unknown;
  orderPriority?: unknown;
  clientPriority?: unknown;
  tag?: unknown;
  orderTag?: unknown;
  clientTag?: unknown;
  label?: unknown;
  orderLabel?: unknown;
  clientLabel?: unknown;
  source?: unknown;
  orderSource?: unknown;
  clientSource?: unknown;
  span?: unknown;
  orderSpan?: unknown;
  clientSpan?: unknown;
  trace?: unknown;
  orderTrace?: unknown;
  clientTrace?: unknown;
  group?: unknown;
  orderGroup?: unknown;
  clientGroup?: unknown;
  reference?: unknown;
  orderReference?: unknown;
  clientReference?: unknown;
  remark?: unknown;
  orderRemark?: unknown;
  clientRemark?: unknown;
  signature?: unknown;
  orderSignature?: unknown;
  clientSignature?: unknown;
  subject?: unknown;
  orderSubject?: unknown;
  clientSubject?: unknown;
  title?: unknown;
  orderTitle?: unknown;
  clientTitle?: unknown;
  uuid?: unknown;
  orderUuid?: unknown;
  clientUuid?: unknown;
  [key: string]: unknown;
}

export interface SubmitResult {
  ok: boolean;
  reason?: string;
  order?: UnifiedOrder;
}

export interface OrderManagerOptions {
  startingCash?: number;
  startingPositions?: Record<string, { amount: number; avgEntry: number }>;
  seenOrders?: UnifiedOrder[];
  lastSubmitAt?: number;
  onPortfolioChange?: (portfolio: { cash: number; positions: Record<string, { amount: number; avgEntry: number }> }) => void;
  onSeenOrdersChange?: (orders: UnifiedOrder[]) => void;
  onLastSubmitAtChange?: (ts: number) => void;
}

export class OrderManager {
  private cash: number;
  private positions: Record<string, { amount: number; avgEntry: number }>;
  private seen: UnifiedOrder[];
  private lastSubmitAt: number;

  constructor(
    private readonly adapter: ExchangeAdapter,
    options: OrderManagerOptions = {},
  ) {
    this.cash = options.startingCash ?? TRADING_CONFIG.paperStartingBalance;
    this.positions = { ...(options.startingPositions ?? {}) };
    this.seen = [...(options.seenOrders ?? [])];
    this.lastSubmitAt = options.lastSubmitAt ?? 0;
  }

  snapshot(): { cash: number; positions: Record<string, { amount: number; avgEntry: number }> } {
    return {
      cash: this.cash,
      positions: { ...this.positions },
    };
  }

  positionAmount(symbol: string): number {
    return this.positions[symbol]?.amount ?? 0;
  }

  seenOrders(): UnifiedOrder[] {
    return [...this.seen];
  }

  /** Paper fills are immediate; live open orders would be canceled via the adapter. */
  async cancelStaleOpenOrders(): Promise<{ canceled: number; failed: number }> {
    try {
      const open = await this.adapter.fetchOpenOrders();
      let canceled = 0;
      let failed = 0;
      const cutoff = Date.now() - TRADING_CONFIG.orders.staleOpenOrderMs;
      for (const o of open) {
        if ((o.timestamp ?? 0) >= cutoff) continue;
        try {
          await this.adapter.cancelOrder(o.id, o.symbol);
          canceled += 1;
        } catch {
          failed += 1;
        }
      }
      return { canceled, failed };
    } catch {
      return { canceled: 0, failed: 0 };
    }
  }

  async cancelAllWorkingOrders(): Promise<{ canceled: number; failed: number }> {
    try {
      const open = await this.adapter.fetchOpenOrders();
      let canceled = 0;
      let failed = 0;
      for (const o of open) {
        try {
          await this.adapter.cancelOrder(o.id, o.symbol);
          canceled += 1;
        } catch {
          failed += 1;
        }
      }
      return { canceled, failed };
    } catch {
      return { canceled: 0, failed: 0 };
    }
  }

  async submit(intent: OrderIntent, riskState: RiskState): Promise<SubmitResult> {
    // Alias and metadata floors first — never reach the adapter if a caller used a non-canonical field.
    const alias =
      positionsAliasReason(intent.positions, intent.orderPositions, intent.basePositions) ||
      portfolioAliasReason(intent.portfolio, intent.orderPortfolio, intent.basePortfolio) ||
      equityAliasReason(intent.equity, intent.orderEquity, intent.baseEquity) ||
      navAliasReason(intent.nav, intent.orderNav, intent.baseNav) ||
      assetsAliasReason(intent.assets, intent.orderAssets, intent.baseAssets) ||
      holdingsAliasReason(intent.holdings, intent.orderHoldings, intent.baseHoldings) ||
      orderHeaderReason(intent.header, intent.orderHeader, intent.clientHeader) ||
      orderFooterReason(intent.footer, intent.orderFooter, intent.clientFooter) ||
      orderAnnotationReason(intent.annotation, intent.orderAnnotation, intent.clientAnnotation) ||
      orderAttributionReason(intent.attribution, intent.orderAttribution, intent.clientAttribution) ||
      orderAudienceReason(intent.audience, intent.orderAudience, intent.clientAudience) ||
      orderBatchReason(intent.batch, intent.orderBatch, intent.clientBatch) ||
      orderBodyReason(intent.body, intent.orderBody, intent.clientBody) ||
      orderCaptionReason(intent.caption, intent.orderCaption, intent.clientCaption) ||
      orderNoteReason(intent.note, intent.orderNote, intent.clientNote) ||
      orderCommentReason(intent.comment, intent.orderComment, intent.clientComment) ||
      orderContextReason(intent.context, intent.orderContext, intent.clientContext) ||
      orderDescriptionReason(intent.description, intent.orderDescription, intent.clientDescription) ||
      orderDigestReason(intent.digest, intent.orderDigest, intent.clientDigest) ||
      orderExpiryReason(intent.cancelAfter, intent.expireTime, intent.goodTillDate) ||
      orderHashReason(intent.hash, intent.orderHash, intent.clientHash) ||
      orderMemoReason(intent.memo, intent.orderMemo, intent.clientMemo) ||
      orderMessageReason(intent.message, intent.orderMessage, intent.clientMessage) ||
      orderMetadataReason(intent.metadata, intent.orderMetadata, intent.clientMetadata) ||
      orderNameReason(intent.name, intent.orderName, intent.clientName) ||
      orderPriorityReason(intent.priority, intent.orderPriority, intent.clientPriority) ||
      orderTagReason(intent.tag, intent.orderTag, intent.clientTag) ||
      orderLabelReason(intent.label, intent.orderLabel, intent.clientLabel) ||
      orderSourceReason(intent.source, intent.orderSource, intent.clientSource) ||
      orderSpanReason(intent.span, intent.orderSpan, intent.clientSpan) ||
      orderTraceReason(intent.trace, intent.orderTrace, intent.clientTrace) ||
      orderGroupReason(intent.group, intent.orderGroup, intent.clientGroup) ||
      orderReferenceReason(intent.reference, intent.orderReference, intent.clientReference) ||
      orderRemarkReason(intent.remark, intent.orderRemark, intent.clientRemark) ||
      orderSignatureReason(intent.signature, intent.orderSignature, intent.clientSignature) ||
      orderSubjectReason(intent.subject, intent.orderSubject, intent.clientSubject) ||
      orderTitleReason(intent.title, intent.orderTitle, intent.clientTitle) ||
      orderUuidReason(intent.uuid, intent.orderUuid, intent.clientUuid);
    if (alias) return { ok: false, reason: alias };

    if (!TRADING_CONFIG.pairs.includes(intent.symbol as never)) {
      return { ok: false, reason: `Unsupported pair: ${intent.symbol}` };
    }

    if (!(intent.amount > 0) || !Number.isFinite(intent.amount)) {
      return { ok: false, reason: "Amount must be a positive finite number" };
    }

    const prec = excessAmountDecimalsReason(intent.amount, TRADING_CONFIG.orders.maxAmountDecimals);
    if (prec) return { ok: false, reason: prec };

    applyHardStops(riskState);
    if (riskState.haltReason) {
      return { ok: false, reason: `Halted: ${riskState.haltReason}` };
    }

    const now = Date.now();
    if (this.lastSubmitAt && now - this.lastSubmitAt < TRADING_CONFIG.orders.minSubmitIntervalMs) {
      return { ok: false, reason: "Submit interval floor" };
    }

    const tradesToday = acceptedTradeCountOnUtcDay(this.seen, now);
    if (tradesToday >= TRADING_CONFIG.risk.maxDailyTrades) {
      return { ok: false, reason: `Daily trade cap reached (${tradesToday}/${TRADING_CONFIG.risk.maxDailyTrades})` };
    }
    const perSym = dailyTradeCapPerSymbolReason(
      intent.symbol,
      acceptedTradeCountOnUtcDay(this.seen.filter((o) => o.symbol === intent.symbol), now),
      TRADING_CONFIG.risk.maxDailyTradesPerSymbol,
    );
    if (perSym) return { ok: false, reason: perSym };

    const notional =
      intent.price && intent.price > 0 ? intent.amount * intent.price : undefined;

    if (intent.side === "buy") {
      const reserved = workingBuyReservedUsd(this.seen);
      const cashReason = cashReserveBuyReason(
        "buy",
        this.cash,
        notional,
        TRADING_CONFIG.risk.minCashReserveUsd,
        reserved,
      );
      if (cashReason) return { ok: false, reason: cashReason };

      if (notional && notional > TRADING_CONFIG.orders.maxOrderNotionalUsd) {
        return { ok: false, reason: `Order notional exceeds max ($${TRADING_CONFIG.orders.maxOrderNotionalUsd})` };
      }
    }

    if (intent.side === "sell") {
      const held = this.positionAmount(intent.symbol);
      if (held + 1e-12 < intent.amount) {
        return { ok: false, reason: `Inventory: no long position in ${intent.symbol}` };
      }
    }

    // Adapter call (paper or kucoin). Keys never leave the adapter.
    const type = intent.type ?? "market";
    let order: UnifiedOrder;
    try {
      if (type === "limit" && intent.price && intent.price > 0) {
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
      return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    }

    this.seen.unshift(order);
    if (this.seen.length > 500) this.seen.length = 500;

    if (order.status !== "rejected" && (order.filled ?? 0) > 0) {
      this.applyFillToBook(order);
      this.lastSubmitAt = now;
    }

    return {
      ok: order.status !== "rejected",
      reason: order.rejectReason,
      order,
    };
  }

  private applyFillToBook(order: UnifiedOrder): void {
    const filled = order.filled ?? 0;
    if (!(filled > 0)) return;
    const px = order.price && order.price > 0 ? order.price : 0;
    const cost = order.cost && order.cost > 0 ? order.cost : filled * px;

    if (order.side === "buy") {
      this.cash = Math.max(0, this.cash - cost);
      const existing = this.positions[order.symbol];
      if (existing) {
        const totalAmt = existing.amount + filled;
        const totalCost = existing.amount * existing.avgEntry + cost;
        this.positions[order.symbol] = {
          amount: totalAmt,
          avgEntry: totalAmt > 0 ? totalCost / totalAmt : px,
        };
      } else {
        this.positions[order.symbol] = { amount: filled, avgEntry: px || 0 };
      }
    } else {
      this.cash += cost;
      const pos = this.positions[order.symbol];
      if (pos) {
        pos.amount = Math.max(0, pos.amount - filled);
        if (pos.amount <= 1e-12) delete this.positions[order.symbol];
      }
    }
  }
}
