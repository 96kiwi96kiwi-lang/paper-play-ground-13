/**
 * OrderManager – single path from bot/strategy to Paper or KuCoin adapter.
 * Default is always paper. Live keys stay server-side only.
 *
 * Metadata floors (priority, note, remark, source, channel, group, label, link, comment, memo, force, response type, STP mode, good-till-time, strategy-id, iceberg, post-only, exec-inst, mmp, price-protect, bbo, price-match, cancel-on-disconnect, grid-id, close-position, reduce-only, time-in-force, is-margin, is-leverage, margin-asset, trade-side, position-side, leverage, auto-borrow, cross-margin, tpsl-order-price, attach-algo, tpsl-order-type, broker-attribution, stop-price, trailing, etc.) refuse before the adapter and do not
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
import { priceProtectReason } from "./price-protect";
import { bboReason } from "./bbo";
import { priceMatchReason } from "./price-match";
import { cancelOnDisconnectReason } from "./cancel-on-disconnect";
import { gridIdReason } from "./grid-id";
import { closePositionReason } from "./close-position";
import { reduceOnlyReason } from "./reduce-only";
import { normalizeTimeInForce } from "./time-in-force";
import { tifAliasReason } from "./tif-alias";
import { isMarginReason } from "./is-margin";
import { isLeverageReason } from "./is-leverage";
import { marginAssetReason } from "./margin-asset";
import { tradeSideReason } from "./trade-side";
import { positionSideReason } from "./position-side";
import { leverageReason } from "./leverage";
import { autoBorrowReason } from "./auto-borrow";
import { crossMarginReason } from "./cross-margin";
import { tpslOrderPriceReason } from "./tpsl-order-price";
import { attachAlgoReason } from "./attach-algo";
import { tpslOrderTypeReason } from "./tpsl-order-type";
import { brokerAttributionReason } from "./broker-attribution";
import { stopPriceReason } from "./stop-price";
import { trailingReason } from "./trailing";

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
  priceProtect?: unknown;
  priceProtection?: unknown;
  percentPrice?: unknown;
  bbo?: unknown;
  bestBidOffer?: unknown;
  bookPrice?: unknown;
  priceMatch?: unknown;
  pegPriceType?: unknown;
  pegOffsetValue?: unknown;
  cancelOnDisconnect?: unknown;
  deadman?: unknown;
  cod?: unknown;
  grid?: unknown;
  gridId?: unknown;
  algoId?: unknown;
  closePosition?: unknown;
  closeOnTrigger?: unknown;
  closeOrder?: unknown;
  reduceOnly?: unknown;
  timeInForce?: unknown;
  tif?: unknown;
  timeInForceAlias?: unknown;
  immediateOrCancel?: unknown;
  fillOrKill?: unknown;
  isMargin?: unknown;
  margin?: unknown;
  is_margin?: unknown;
  isLeverage?: unknown;
  leverageFlag?: unknown;
  marginLeverage?: unknown;
  marginAsset?: unknown;
  marginCoin?: unknown;
  mgnCcy?: unknown;
  tradeSide?: unknown;
  holdSide?: unknown;
  openType?: unknown;
  positionSide?: unknown;
  hedgeMode?: unknown;
  positionMode?: unknown;
  leverage?: unknown;
  isolated?: unknown;
  marginMode?: unknown;
  autoBorrow?: unknown;
  autoRepay?: unknown;
  mgnMode?: unknown;
  tradeMode?: unknown;
  isCross?: unknown;
  tpOrdPx?: unknown;
  slOrdPx?: unknown;
  tpslPx?: unknown;
  attachAlgoOrds?: unknown;
  tpTriggerPx?: unknown;
  slTriggerPx?: unknown;
  tpOrderType?: unknown;
  slOrderType?: unknown;
  tpslMode?: unknown;
  brokerId?: unknown;
  brokerClientId?: unknown;
  rebate?: unknown;
  stopPrice?: unknown;
  triggerPrice?: unknown;
  stopPx?: unknown;
  trailingStop?: unknown;
  trailingDelta?: unknown;
  callbackRate?: unknown;
  activationPrice?: unknown;
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
   * Submit an order. Priority, note, remark, source, channel, group, label, link, comment, memo, force, response-type, STP mode, good-till-time, strategy-id, iceberg, post-only, exec-inst, mmp, price-protect, bbo, price-match, cancel-on-disconnect, grid-id, close-position, reduce-only, time-in-force, is-margin, is-leverage, margin-asset, trade-side, position-side, leverage, auto-borrow, cross-margin, tpsl-order-price, attach-algo, tpsl-order-type, broker-attribution, stop-price, and trailing floors run first so a refuse does not count as an adapter reject.
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

    const priceProtectRefuse = priceProtectReason(
      intent.priceProtect,
      intent.priceProtection,
      intent.percentPrice,
    );
    if (priceProtectRefuse) {
      return { ok: false, reason: priceProtectRefuse };
    }

    const bboRefuse = bboReason(
      intent.bbo,
      intent.bestBidOffer,
      intent.bookPrice,
    );
    if (bboRefuse) {
      return { ok: false, reason: bboRefuse };
    }

    const priceMatchRefuse = priceMatchReason(
      intent.priceMatch,
      intent.pegPriceType,
      intent.pegOffsetValue,
    );
    if (priceMatchRefuse) {
      return { ok: false, reason: priceMatchRefuse };
    }

    const cancelOnDisconnectRefuse = cancelOnDisconnectReason(
      intent.cancelOnDisconnect,
      intent.deadman,
      intent.cod,
    );
    if (cancelOnDisconnectRefuse) {
      return { ok: false, reason: cancelOnDisconnectRefuse };
    }

    const gridIdRefuse = gridIdReason(
      intent.grid,
      intent.gridId,
      intent.algoId,
    );
    if (gridIdRefuse) {
      return { ok: false, reason: gridIdRefuse };
    }

    const closePositionRefuse = closePositionReason(
      intent.closePosition,
      intent.closeOnTrigger,
      intent.closeOrder,
    );
    if (closePositionRefuse) {
      return { ok: false, reason: closePositionRefuse };
    }

    const reduceOnlyRefuse = reduceOnlyReason(intent.reduceOnly);
    if (reduceOnlyRefuse) {
      return { ok: false, reason: reduceOnlyRefuse };
    }

    const tifAliasRefuse = tifAliasReason(
      intent.tif,
      intent.timeInForceAlias,
      intent.immediateOrCancel,
      intent.fillOrKill,
    );
    if (tifAliasRefuse) {
      return { ok: false, reason: tifAliasRefuse };
    }

    const tifNorm = normalizeTimeInForce(intent.timeInForce);
    if ("reason" in tifNorm) {
      return { ok: false, reason: tifNorm.reason };
    }

    const isMarginRefuse = isMarginReason(
      intent.isMargin,
      intent.margin,
      intent.is_margin,
    );
    if (isMarginRefuse) {
      return { ok: false, reason: isMarginRefuse };
    }

    const isLeverageRefuse = isLeverageReason(
      intent.isLeverage,
      intent.leverageFlag,
      intent.marginLeverage,
    );
    if (isLeverageRefuse) {
      return { ok: false, reason: isLeverageRefuse };
    }

    const marginAssetRefuse = marginAssetReason(
      intent.marginAsset,
      intent.marginCoin,
      intent.mgnCcy,
    );
    if (marginAssetRefuse) {
      return { ok: false, reason: marginAssetRefuse };
    }

    const tradeSideRefuse = tradeSideReason(
      intent.tradeSide,
      intent.holdSide,
      intent.openType,
    );
    if (tradeSideRefuse) {
      return { ok: false, reason: tradeSideRefuse };
    }

    const positionSideRefuse = positionSideReason(
      intent.positionSide,
      intent.hedgeMode,
      intent.positionMode,
    );
    if (positionSideRefuse) {
      return { ok: false, reason: positionSideRefuse };
    }

    const leverageRefuse = leverageReason(
      intent.leverage,
      intent.isolated,
      intent.marginMode,
    );
    if (leverageRefuse) {
      return { ok: false, reason: leverageRefuse };
    }

    const autoBorrowRefuse = autoBorrowReason(
      intent.autoBorrow,
      intent.autoRepay,
    );
    if (autoBorrowRefuse) {
      return { ok: false, reason: autoBorrowRefuse };
    }

    const crossMarginRefuse = crossMarginReason(
      intent.mgnMode,
      intent.tradeMode,
      intent.isCross,
    );
    if (crossMarginRefuse) {
      return { ok: false, reason: crossMarginRefuse };
    }

    const tpslOrderPriceRefuse = tpslOrderPriceReason(
      intent.tpOrdPx,
      intent.slOrdPx,
      intent.tpslPx,
    );
    if (tpslOrderPriceRefuse) {
      return { ok: false, reason: tpslOrderPriceRefuse };
    }

    const attachAlgoRefuse = attachAlgoReason(
      intent.attachAlgoOrds,
      intent.tpTriggerPx,
      intent.slTriggerPx,
    );
    if (attachAlgoRefuse) {
      return { ok: false, reason: attachAlgoRefuse };
    }

    const tpslOrderTypeRefuse = tpslOrderTypeReason(
      intent.tpOrderType,
      intent.slOrderType,
      intent.tpslMode,
    );
    if (tpslOrderTypeRefuse) {
      return { ok: false, reason: tpslOrderTypeRefuse };
    }

    const brokerAttributionRefuse = brokerAttributionReason(
      intent.brokerId,
      intent.brokerClientId,
      intent.rebate,
    );
    if (brokerAttributionRefuse) {
      return { ok: false, reason: brokerAttributionRefuse };
    }

    const stopPriceRefuse = stopPriceReason(
      intent.stopPrice,
      intent.triggerPrice,
      intent.stopPx,
    );
    if (stopPriceRefuse) {
      return { ok: false, reason: stopPriceRefuse };
    }

    const trailingRefuse = trailingReason(
      intent.trailingStop,
      intent.trailingDelta,
      intent.callbackRate,
      intent.activationPrice,
    );
    if (trailingRefuse) {
      return { ok: false, reason: trailingRefuse };
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
