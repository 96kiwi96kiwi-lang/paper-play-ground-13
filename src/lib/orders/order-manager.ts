/**
 * OrderManager – single path from bot/strategy to Paper or KuCoin adapter.
 * Default is always paper. Live keys stay server-side only.
 *
 * Metadata floors (priority, note, remark, source, channel, group, label, link, comment, memo, force, response type, STP mode, good-till-time, strategy-id, iceberg, post-only, exec-inst, mmp, etc.) refuse before the adapter and do not
 * burn maxRejectsInWindow. Not a halt; does not flatten positions.
 */

import { TRADING_CONFIG } from "@/config/trading";
import type { ExchangeAdapter, Side, UnifiedOrder } from "@/lib/exchange/types";
import type { RiskState } from "@/lib/risk";
import { orderChannelReason } from "./order-channel";
import { orderCommentReason } from "./order-comment";
import { orderForceReason } from "./order-force";
import { orderGroupReason } from "./order-group";
import { orderLabelReason } from "./order-label";
import { orderLinkReason } from "./order-link";
import { orderMemoReason } from "./order-memo";
import { orderNoteReason } from "./order-note";
import { orderPriorityReason } from "./order-priority";
import { orderRemarkReason } from "./order-remark";
import { orderSourceReason } from "./order-source";
import { responseTypeReason } from "./response-type";
import { stpModeReason } from "./stp-mode";
import { goodTillTimeReason } from "./good-till-time";
import { strategyIdReason } from "./strategy-id";
import { icebergReason } from "./iceberg";
import { postOnlyReason } from "./post-only";
import { execInstReason } from "./exec-inst";
import { mmpReason } from "./mmp";

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
  remark?: unknown;
  tag?: unknown;
  clientTag?: unknown;
  source?: unknown;
  orderSource?: unknown;
  src?: unknown;
  channel?: unknown;
  orderChannel?: unknown;
  origin?: unknown;
  group?: unknown;
  orderGroup?: unknown;
  clientGroup?: unknown;
  label?: unknown;
  orderLabel?: unknown;
  clientLabel?: unknown;
  clOrdId?: unknown;
  orderLinkId?: unknown;
  linkId?: unknown;
  comment?: unknown;
  orderComment?: unknown;
  clientComment?: unknown;
  memo?: unknown;
  orderMemo?: unknown;
  clientMemo?: unknown;
  force?: unknown;
  forceType?: unknown;
  orderForce?: unknown;
  newOrderRespType?: unknown;
  orderRespType?: unknown;
  respType?: unknown;
  stpMode?: unknown;
  smpType?: unknown;
  preventSelfTrade?: unknown;
  goodTillTime?: unknown;
  gtd?: unknown;
  expireAt?: unknown;
  strategyId?: unknown;
  strategyType?: unknown;
  workingType?: unknown;
  iceberg?: unknown;
  visibleSize?: unknown;
  icebergQty?: unknown;
  displayQty?: unknown;
  hiddenSize?: unknown;
  displaySize?: unknown;
  visibleQty?: unknown;
  icebergSize?: unknown;
  postOnly?: unknown;
  postOnlyFlag?: unknown;
  makerOnly?: unknown;
  execInst?: unknown;
  execInstruction?: unknown;
  instruction?: unknown;
  mmp?: unknown;
  mmpGroup?: unknown;
  marketMakerProtection?: unknown;
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
   * Submit an order. Priority, note, remark, source, channel, group, label, link, comment, memo, force, response-type, STP mode, good-till-time, strategy-id, iceberg, post-only, exec-inst, and mmp floors run first so a refuse does not count as an adapter reject.
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

    const remarkRefuse = orderRemarkReason(
      intent.remark,
      intent.tag,
      intent.clientTag,
    );
    if (remarkRefuse) {
      return { ok: false, reason: remarkRefuse };
    }

    const sourceRefuse = orderSourceReason(
      intent.source,
      intent.orderSource,
      intent.src,
    );
    if (sourceRefuse) {
      return { ok: false, reason: sourceRefuse };
    }

    const channelRefuse = orderChannelReason(
      intent.channel,
      intent.orderChannel,
      intent.origin,
    );
    if (channelRefuse) {
      return { ok: false, reason: channelRefuse };
    }

    const groupRefuse = orderGroupReason(
      intent.group,
      intent.orderGroup,
      intent.clientGroup,
    );
    if (groupRefuse) {
      return { ok: false, reason: groupRefuse };
    }

    const labelRefuse = orderLabelReason(
      intent.label,
      intent.orderLabel,
      intent.clientLabel,
    );
    if (labelRefuse) {
      return { ok: false, reason: labelRefuse };
    }

    const linkRefuse = orderLinkReason(
      intent.clOrdId,
      intent.orderLinkId,
      intent.linkId,
    );
    if (linkRefuse) {
      return { ok: false, reason: linkRefuse };
    }

    const commentRefuse = orderCommentReason(
      intent.comment,
      intent.orderComment,
      intent.clientComment,
    );
    if (commentRefuse) {
      return { ok: false, reason: commentRefuse };
    }

    const memoRefuse = orderMemoReason(
      intent.memo,
      intent.orderMemo,
      intent.clientMemo,
    );
    if (memoRefuse) {
      return { ok: false, reason: memoRefuse };
    }

    const forceRefuse = orderForceReason(
      intent.force,
      intent.forceType,
      intent.orderForce,
    );
    if (forceRefuse) {
      return { ok: false, reason: forceRefuse };
    }

    const responseTypeRefuse = responseTypeReason(
      intent.newOrderRespType,
      intent.orderRespType,
      intent.respType,
    );
    if (responseTypeRefuse) {
      return { ok: false, reason: responseTypeRefuse };
    }

    const stpModeRefuse = stpModeReason(
      intent.stpMode,
      intent.smpType,
      intent.preventSelfTrade,
    );
    if (stpModeRefuse) {
      return { ok: false, reason: stpModeRefuse };
    }

    const goodTillTimeRefuse = goodTillTimeReason(
      intent.goodTillTime,
      intent.gtd,
      intent.expireAt,
    );
    if (goodTillTimeRefuse) {
      return { ok: false, reason: goodTillTimeRefuse };
    }

    const strategyIdRefuse = strategyIdReason(
      intent.strategyId,
      intent.strategyType,
      intent.workingType,
    );
    if (strategyIdRefuse) {
      return { ok: false, reason: strategyIdRefuse };
    }

    const icebergRefuse = icebergReason(
      intent.iceberg,
      intent.visibleSize,
      intent.icebergQty,
      intent.displayQty,
      intent.hiddenSize,
      intent.displaySize,
      intent.visibleQty,
      intent.icebergSize,
    );
    if (icebergRefuse) {
      return { ok: false, reason: icebergRefuse };
    }

    const postOnlyRefuse = postOnlyReason(
      intent.postOnly,
      intent.postOnlyFlag,
      intent.makerOnly,
    );
    if (postOnlyRefuse) {
      return { ok: false, reason: postOnlyRefuse };
    }

    const execInstRefuse = execInstReason(
      intent.execInst,
      intent.execInstruction,
      intent.instruction,
    );
    if (execInstRefuse) {
      return { ok: false, reason: execInstRefuse };
    }

    const mmpRefuse = mmpReason(
      intent.mmp,
      intent.mmpGroup,
      intent.marketMakerProtection,
    );
    if (mmpRefuse) {
      return { ok: false, reason: mmpRefuse };
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
