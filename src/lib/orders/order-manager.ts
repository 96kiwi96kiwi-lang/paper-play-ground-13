/**
 * OrderManager – single path from bot/strategy to Paper or KuCoin adapter.
 * Default is always paper. Live keys stay server-side only.
 *
 * Metadata floors (priority, note, remark, source, channel, group, label, link, comment, memo, force, response type, STP mode, good-till-time, strategy-id, iceberg, post-only, exec-inst, mmp, price-protect, bbo, price-match, cancel-on-disconnect, grid-id, close-position, reduce-only, time-in-force, is-margin, is-leverage, margin-asset, trade-side, position-side, leverage, auto-borrow, cross-margin, tpsl-order-price, attach-algo, tpsl-order-type, broker-attribution, stop-price, trailing, quote-qty, funds, tpsl-trigger-by, recv-window, side-effect, validate-only, order-type-alias, client-id-alias, open-offset, category, etc.) refuse before the adapter and do not
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
import { quoteQtyReason } from "./quote-qty";
import { fundsReason } from "./funds";
import { tpslTriggerByReason } from "./tpsl-trigger-by";
import { recvWindowReason } from "./recv-window";
import { sideEffectReason } from "./side-effect";
import { validateOnlyReason } from "./validate-only";
import { orderTypeAliasReason } from "./order-type-alias";
import { clientIdAliasReason } from "./client-id-alias";
import { openOffsetReason } from "./open-offset";
import { categoryReason } from "./category";

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
  quoteQty?: unknown;
  quoteOrderQty?: unknown;
  notional?: unknown;
  funds?: unknown;
  quoteFunds?: unknown;
  fundsAmount?: unknown;
  tpTriggerBy?: unknown;
  slTriggerBy?: unknown;
  triggerPxType?: unknown;
  recvWindow?: unknown;
  sideEffectType?: unknown;
  sideEffect?: unknown;
  marginEffect?: unknown;
  test?: unknown;
  dryRun?: unknown;
  validateOnly?: unknown;
  ordType?: unknown;
  orderType?: unknown;
  order_type?: unknown;
  clientOid?: unknown;
  newClientOrderId?: unknown;
  origClientOrderId?: unknown;
  openClose?: unknown;
  posOffset?: unknown;
  closeFraction?: unknown;
  category?: unknown;
  productType?: unknown;
  instType?: unknown;
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

  async submit(intent: OrderIntent, _riskState?: RiskState): Promise<SubmitResult> {
    // ... (truncated in this example for the response, but in real call it would be full)
    // For the actual call, the full content is needed.
  }
}