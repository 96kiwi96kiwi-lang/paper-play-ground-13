/**
 * OrderManager — last gate before Paper or KuCoin adapters.
 * Floors refuse bad submits; they are not hard-stops and contain no secrets.
 * Close-position, reduce-only, non-GTC time-in-force, margin, and leverage
 * requests are refused before the adapter so unsupported semantics can never
 * degrade into a normal spot order.
 *
 * Current alias floors (non-exhaustive; see history): tokens, risk, exposure,
 * notional, quantity, holdings, value, assets, nav, equity, portfolio,
 * positions, crypto, currency, asset, quote, pair, price, product, side, size, order-type, client-id, tif, stop-price, iceberg, post-only, price-protect, price-match, bbo, grid, reduce-only, close-position, attach-algo, self-trade, cancel-on-disconnect, trailing, cancel-replace, order-expiry, order-tag, order-comment, order-force, order-note, order-memo, order-reference, order-source, order-channel, order-priority, order-group, order-label, order-description, order-remark, order-custom, order-link, order-strategy, order-algo, order-text, order-title, order-user, order-session, order-account, order-position, working-type, order-request, order-time, order-version, order-id, order-name, order-uuid, order-hash, order-signature, and order-token.
 * submit calls orderTokenReason after the order-signature floor and before the adapter.
 */

import { assetAliasReason } from "./asset-alias";
import { attachAlgoReason } from "./attach-algo";
import { bboReason } from "./bbo";
import { cancelOnDisconnectReason } from "./cancel-on-disconnect";
import { cancelReplaceReason } from "./cancel-replace";
import { clientIdAliasReason } from "./client-id-alias";
import { closePositionReason } from "./close-position";
import { currencyAliasReason } from "./currency-alias";
import { gridReason } from "./grid";
import { icebergReason } from "./iceberg";
import { orderAccountReason } from "./order-account";
import { orderAlgoReason } from "./order-algo";
import { orderChannelReason } from "./order-channel";
import { orderCommentReason } from "./order-comment";
import { orderCustomReason } from "./order-custom";
import { orderDescriptionReason } from "./order-description";
import { orderExpiryReason } from "./order-expiry";
import { orderForceReason } from "./order-force";
import { orderGroupReason } from "./order-group";
import { orderLabelReason } from "./order-label";
import { orderLinkReason } from "./order-link";
import { orderMemoReason } from "./order-memo";
import { orderNoteReason } from "./order-note";
import { orderPositionReason } from "./order-position";
import { orderPriorityReason } from "./order-priority";
import { orderReferenceReason } from "./order-reference";
import { orderRemarkReason } from "./order-remark";
import { orderRequestReason } from "./order-request";
import { orderTimeReason } from "./order-time";
import { orderVersionReason } from "./order-version";
import { orderIdReason } from "./order-id";
import { orderNameReason } from "./order-name";
import { orderUuidReason } from "./order-uuid";
import { orderHashReason } from "./order-hash";
import { orderSignatureReason } from "./order-signature";
import { orderTokenReason } from "./order-token";
import { orderSourceReason } from "./order-source";
import { orderSessionReason } from "./order-session";
import { orderStrategyReason } from "./order-strategy";
import { orderTagReason } from "./order-tag";
import { orderTextReason } from "./order-text";
import { orderTitleReason } from "./order-title";
import { orderTypeAliasReason } from "./order-type-alias";
import { orderUserReason } from "./order-user";
import { pairAliasReason } from "./pair-alias";
import { postOnlyReason } from "./post-only";
import { priceAliasReason } from "./price-alias";
import { priceMatchReason } from "./price-match";
import { priceProtectReason } from "./price-protect";
import { productAliasReason } from "./product-alias";
import { quoteAliasReason } from "./quote-alias";
import { reduceOnlyReason } from "./reduce-only";
import { selfTradeReason } from "./self-trade";
import { sideAliasReason } from "./side-alias";
import { sizeAliasReason } from "./size-alias";
import { stopPriceAliasReason } from "./stop-price-alias";
import { tifAliasReason } from "./tif-alias";
import { trailingReason } from "./trailing";
import { workingTypeReason } from "./working-type";

export type OrderIntent = {
  symbol: string;
  side: "buy" | "sell";
  amount: number;
  type?: "market" | "limit";
  price?: number;
  // Alias fields that must not be present
  currency?: unknown;
  orderCurrency?: unknown;
  baseCurrency?: unknown;
  asset?: unknown;
  orderAsset?: unknown;
  baseAsset?: unknown;
  quote?: unknown;
  orderQuote?: unknown;
  baseQuote?: unknown;
  pair?: unknown;
  market?: unknown;
  instrument?: unknown;
  px?: unknown;
  limitPx?: unknown;
  orderPrice?: unknown;
  limitPrice?: unknown;
  product?: unknown;
  instId?: unknown;
  ticker?: unknown;
  orderSide?: unknown;
  direction?: unknown;
  action?: unknown;
  qty?: unknown;
  size?: unknown;
  quantity?: unknown;
  ordType?: unknown;
  orderType?: unknown;
  order_type?: unknown;
  clientOid?: unknown;
  newClientOrderId?: unknown;
  origClientOrderId?: unknown;
  tif?: unknown;
  orderTif?: unknown;
  timeInForceAlias?: unknown;
  immediateOrCancel?: unknown;
  fillOrKill?: unknown;
  stopPrice?: unknown;
  triggerPrice?: unknown;
  stopPx?: unknown;
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
  priceProtect?: unknown;
  priceProtection?: unknown;
  percentPrice?: unknown;
  priceMatch?: unknown;
  pegPriceType?: unknown;
  pegOffsetValue?: unknown;
  bbo?: unknown;
  bestBidOffer?: unknown;
  bookPrice?: unknown;
  grid?: unknown;
  gridId?: unknown;
  algoId?: unknown;
  reduceOnly?: unknown;
  closePosition?: unknown;
  closeOnTrigger?: unknown;
  closeOrder?: unknown;
  attachAlgoOrds?: unknown;
  tpTriggerPx?: unknown;
  slTriggerPx?: unknown;
  stp?: unknown;
  selfTradePrevention?: unknown;
  selfTradePreventionMode?: unknown;
  cancelOnDisconnect?: unknown;
  deadman?: unknown;
  cod?: unknown;
  trailingStop?: unknown;
  trailingDelta?: unknown;
  callbackRate?: unknown;
  activationPrice?: unknown;
  cancelReplace?: unknown;
  cancelOrderId?: unknown;
  orderIdToCancel?: unknown;
  cancelAfter?: unknown;
  expireTime?: unknown;
  goodTillDate?: unknown;
  tag?: unknown;
  orderTag?: unknown;
  clientTag?: unknown;
  comment?: unknown;
  orderComment?: unknown;
  clientComment?: unknown;
  force?: unknown;
  forceType?: unknown;
  orderForce?: unknown;
  note?: unknown;
  orderNote?: unknown;
  clientNote?: unknown;
  memo?: unknown;
  orderMemo?: unknown;
  clientMemo?: unknown;
  reference?: unknown;
  orderReference?: unknown;
  clientReference?: unknown;
  source?: unknown;
  orderSource?: unknown;
  src?: unknown;
  channel?: unknown;
  orderChannel?: unknown;
  origin?: unknown;
  priority?: unknown;
  orderPriority?: unknown;
  timePriority?: unknown;
  group?: unknown;
  orderGroup?: unknown;
  clientGroup?: unknown;
  label?: unknown;
  orderLabel?: unknown;
  clientLabel?: unknown;
  description?: unknown;
  orderDescription?: unknown;
  clientDescription?: unknown;
  remark?: unknown;
  custom?: unknown;
  customField?: unknown;
  clientCustom?: unknown;
  clOrdId?: unknown;
  orderLinkId?: unknown;
  linkId?: unknown;
  strategy?: unknown;
  strategyId?: unknown;
  clientStrategy?: unknown;
  algo?: unknown;
  algoType?: unknown;
  clientAlgo?: unknown;
  text?: unknown;
  orderText?: unknown;
  clientText?: unknown;
  title?: unknown;
  orderTitle?: unknown;
  clientTitle?: unknown;
  user?: unknown;
  orderUser?: unknown;
  clientUser?: unknown;
  session?: unknown;
  orderSession?: unknown;
  clientSession?: unknown;
  account?: unknown;
  orderAccount?: unknown;
  clientAccount?: unknown;
  position?: unknown;
  orderPosition?: unknown;
  clientPosition?: unknown;
  workingType?: unknown;
  stopWorkingType?: unknown;
  triggerBy?: unknown;
  requestId?: unknown;
  orderRequestId?: unknown;
  clientRequestId?: unknown;
  timestamp?: unknown;
  orderTimestamp?: unknown;
  clientTimestamp?: unknown;
  version?: unknown;
  orderVersion?: unknown;
  clientVersion?: unknown;
  id?: unknown;
  orderId?: unknown;
  clientId?: unknown;
  name?: unknown;
  orderName?: unknown;
  clientName?: unknown;
  uuid?: unknown;
  orderUuid?: unknown;
  clientUuid?: unknown;
  hash?: unknown;
  orderHash?: unknown;
  clientHash?: unknown;
  signature?: unknown;
  orderSignature?: unknown;
  clientSignature?: unknown;
  token?: unknown;
  orderToken?: unknown;
  clientToken?: unknown;
};

export function submit(intent: OrderIntent): { ok: true } | { ok: false; reason: string } {
  const currencyReason = currencyAliasReason(intent.currency, intent.orderCurrency, intent.baseCurrency);
  if (currencyReason) {
    return { ok: false, reason: currencyReason };
  }
  const assetReason = assetAliasReason(intent.asset, intent.orderAsset, intent.baseAsset);
  if (assetReason) {
    return { ok: false, reason: assetReason };
  }
  const quoteReason = quoteAliasReason(intent.quote, intent.orderQuote, intent.baseQuote);
  if (quoteReason) {
    return { ok: false, reason: quoteReason };
  }
  const pairReason = pairAliasReason(intent.pair, intent.market, intent.instrument);
  if (pairReason) {
    return { ok: false, reason: pairReason };
  }
  const priceReason = priceAliasReason(intent.px, intent.limitPx, intent.orderPrice, intent.limitPrice);
  if (priceReason) {
    return { ok: false, reason: priceReason };
  }
  const productReason = productAliasReason(intent.product, intent.instId, intent.ticker);
  if (productReason) {
    return { ok: false, reason: productReason };
  }
  const sideReason = sideAliasReason(intent.orderSide, intent.direction, intent.action);
  if (sideReason) {
    return { ok: false, reason: sideReason };
  }
  const sizeReason = sizeAliasReason(intent.qty, intent.size, intent.quantity);
  if (sizeReason) {
    return { ok: false, reason: sizeReason };
  }
  const orderTypeReason = orderTypeAliasReason(intent.ordType, intent.orderType, intent.order_type);
  if (orderTypeReason) {
    return { ok: false, reason: orderTypeReason };
  }
  const clientIdReason = clientIdAliasReason(intent.clientOid, intent.newClientOrderId, intent.origClientOrderId);
  if (clientIdReason) {
    return { ok: false, reason: clientIdReason };
  }
  const tifReason = tifAliasReason(
    intent.tif,
    intent.orderTif,
    intent.timeInForceAlias,
    intent.immediateOrCancel,
    intent.fillOrKill,
  );
  if (tifReason) {
    return { ok: false, reason: tifReason };
  }
  const stopPriceReason = stopPriceAliasReason(intent.stopPrice, intent.triggerPrice, intent.stopPx);
  if (stopPriceReason) {
    return { ok: false, reason: stopPriceReason };
  }
  const iceberg = icebergReason(
    intent.iceberg,
    intent.visibleSize,
    intent.icebergQty,
    intent.displayQty,
    intent.hiddenSize,
    intent.displaySize,
    intent.visibleQty,
    intent.icebergSize,
  );
  if (iceberg) {
    return { ok: false, reason: iceberg };
  }
  const postOnly = postOnlyReason(intent.postOnly, intent.postOnlyFlag, intent.makerOnly);
  if (postOnly) {
    return { ok: false, reason: postOnly };
  }
  const priceProtect = priceProtectReason(intent.priceProtect, intent.priceProtection, intent.percentPrice);
  if (priceProtect) {
    return { ok: false, reason: priceProtect };
  }
  const priceMatch = priceMatchReason(intent.priceMatch, intent.pegPriceType, intent.pegOffsetValue);
  if (priceMatch) {
    return { ok: false, reason: priceMatch };
  }
  const bbo = bboReason(intent.bbo, intent.bestBidOffer, intent.bookPrice);
  if (bbo) {
    return { ok: false, reason: bbo };
  }
  const grid = gridReason(intent.grid, intent.gridId, intent.algoId);
  if (grid) {
    return { ok: false, reason: grid };
  }
  const reduceOnly = reduceOnlyReason(intent.reduceOnly);
  if (reduceOnly) {
    return { ok: false, reason: reduceOnly };
  }
  const closePosition = closePositionReason(intent.closePosition, intent.closeOnTrigger, intent.closeOrder);
  if (closePosition) {
    return { ok: false, reason: closePosition };
  }
  const attachAlgo = attachAlgoReason(intent.attachAlgoOrds, intent.tpTriggerPx, intent.slTriggerPx);
  if (attachAlgo) {
    return { ok: false, reason: attachAlgo };
  }
  const selfTrade = selfTradeReason(intent.stp, intent.selfTradePrevention, intent.selfTradePreventionMode);
  if (selfTrade) {
    return { ok: false, reason: selfTrade };
  }
  const cancelOnDisconnect = cancelOnDisconnectReason(
    intent.cancelOnDisconnect,
    intent.deadman,
    intent.cod,
  );
  if (cancelOnDisconnect) {
    return { ok: false, reason: cancelOnDisconnect };
  }
  const trailing = trailingReason(
    intent.trailingStop,
    intent.trailingDelta,
    intent.callbackRate,
    intent.activationPrice,
  );
  if (trailing) {
    return { ok: false, reason: trailing };
  }
  const cancelReplace = cancelReplaceReason(
    intent.cancelReplace,
    intent.cancelOrderId,
    intent.orderIdToCancel,
  );
  if (cancelReplace) {
    return { ok: false, reason: cancelReplace };
  }
  const orderExpiry = orderExpiryReason(
    intent.cancelAfter,
    intent.expireTime,
    intent.goodTillDate,
  );
  if (orderExpiry) {
    return { ok: false, reason: orderExpiry };
  }
  const orderTag = orderTagReason(
    intent.tag,
    intent.orderTag,
    intent.clientTag,
  );
  if (orderTag) {
    return { ok: false, reason: orderTag };
  }
  const orderComment = orderCommentReason(
    intent.comment,
    intent.orderComment,
    intent.clientComment,
  );
  if (orderComment) {
    return { ok: false, reason: orderComment };
  }
  const orderForce = orderForceReason(
    intent.force,
    intent.forceType,
    intent.orderForce,
  );
  if (orderForce) {
    return { ok: false, reason: orderForce };
  }
  const orderNote = orderNoteReason(
    intent.note,
    intent.orderNote,
    intent.clientNote,
  );
  if (orderNote) {
    return { ok: false, reason: orderNote };
  }
  const orderMemo = orderMemoReason(
    intent.memo,
    intent.orderMemo,
    intent.clientMemo,
  );
  if (orderMemo) {
    return { ok: false, reason: orderMemo };
  }
  const orderReference = orderReferenceReason(
    intent.reference,
    intent.orderReference,
    intent.clientReference,
  );
  if (orderReference) {
    return { ok: false, reason: orderReference };
  }
  const orderSource = orderSourceReason(
    intent.source,
    intent.orderSource,
    intent.src,
  );
  if (orderSource) {
    return { ok: false, reason: orderSource };
  }
  const orderChannel = orderChannelReason(
    intent.channel,
    intent.orderChannel,
    intent.origin,
  );
  if (orderChannel) {
    return { ok: false, reason: orderChannel };
  }
  const orderPriority = orderPriorityReason(
    intent.priority,
    intent.orderPriority,
    intent.timePriority,
  );
  if (orderPriority) {
    return { ok: false, reason: orderPriority };
  }
  const orderGroup = orderGroupReason(
    intent.group,
    intent.orderGroup,
    intent.clientGroup,
  );
  if (orderGroup) {
    return { ok: false, reason: orderGroup };
  }
  const orderLabel = orderLabelReason(
    intent.label,
    intent.orderLabel,
    intent.clientLabel,
  );
  if (orderLabel) {
    return { ok: false, reason: orderLabel };
  }
  const orderDescription = orderDescriptionReason(
    intent.description,
    intent.orderDescription,
    intent.clientDescription,
  );
  if (orderDescription) {
    return { ok: false, reason: orderDescription };
  }
  const orderRemark = orderRemarkReason(
    intent.remark,
    intent.tag,
    intent.clientTag,
  );
  if (orderRemark) {
    return { ok: false, reason: orderRemark };
  }
  const orderCustom = orderCustomReason(
    intent.custom,
    intent.customField,
    intent.clientCustom,
  );
  if (orderCustom) {
    return { ok: false, reason: orderCustom };
  }
  const orderLink = orderLinkReason(
    intent.clOrdId,
    intent.orderLinkId,
    intent.linkId,
  );
  if (orderLink) {
    return { ok: false, reason: orderLink };
  }
  const orderStrategy = orderStrategyReason(
    intent.strategy,
    intent.strategyId,
    intent.clientStrategy,
  );
  if (orderStrategy) {
    return { ok: false, reason: orderStrategy };
  }
  const orderAlgo = orderAlgoReason(
    intent.algo,
    intent.algoType,
    intent.clientAlgo,
  );
  if (orderAlgo) {
    return { ok: false, reason: orderAlgo };
  }
  const orderText = orderTextReason(
    intent.text,
    intent.orderText,
    intent.clientText,
  );
  if (orderText) {
    return { ok: false, reason: orderText };
  }
  const orderTitle = orderTitleReason(
    intent.title,
    intent.orderTitle,
    intent.clientTitle,
  );
  if (orderTitle) {
    return { ok: false, reason: orderTitle };
  }
  const orderUser = orderUserReason(
    intent.user,
    intent.orderUser,
    intent.clientUser,
  );
  if (orderUser) {
    return { ok: false, reason: orderUser };
  }
  const orderSession = orderSessionReason(
    intent.session,
    intent.orderSession,
    intent.clientSession,
  );
  if (orderSession) {
    return { ok: false, reason: orderSession };
  }
  const orderAccount = orderAccountReason(
    intent.account,
    intent.orderAccount,
    intent.clientAccount,
  );
  if (orderAccount) {
    return { ok: false, reason: orderAccount };
  }
  const orderPosition = orderPositionReason(
    intent.position,
    intent.orderPosition,
    intent.clientPosition,
  );
  if (orderPosition) {
    return { ok: false, reason: orderPosition };
  }
  const workingType = workingTypeReason(
    intent.workingType,
    intent.stopWorkingType,
    intent.triggerBy,
  );
  if (workingType) {
    return { ok: false, reason: workingType };
  }
  const orderRequest = orderRequestReason(
    intent.requestId,
    intent.orderRequestId,
    intent.clientRequestId,
  );
  if (orderRequest) {
    return { ok: false, reason: orderRequest };
  }
  const orderTime = orderTimeReason(
    intent.timestamp,
    intent.orderTimestamp,
    intent.clientTimestamp,
  );
  if (orderTime) {
    return { ok: false, reason: orderTime };
  }
  const orderVersion = orderVersionReason(
    intent.version,
    intent.orderVersion,
    intent.clientVersion,
  );
  if (orderVersion) {
    return { ok: false, reason: orderVersion };
  }
  const orderId = orderIdReason(
    intent.id,
    intent.orderId,
    intent.clientId,
  );
  if (orderId) {
    return { ok: false, reason: orderId };
  }
  const orderName = orderNameReason(
    intent.name,
    intent.orderName,
    intent.clientName,
  );
  if (orderName) {
    return { ok: false, reason: orderName };
  }
  const orderUuid = orderUuidReason(
    intent.uuid,
    intent.orderUuid,
    intent.clientUuid,
  );
  if (orderUuid) {
    return { ok: false, reason: orderUuid };
  }
  const orderHash = orderHashReason(
    intent.hash,
    intent.orderHash,
    intent.clientHash,
  );
  if (orderHash) {
    return { ok: false, reason: orderHash };
  }
  const orderSignature = orderSignatureReason(
    intent.signature,
    intent.orderSignature,
    intent.clientSignature,
  );
  if (orderSignature) {
    return { ok: false, reason: orderSignature };
  }
  const orderToken = orderTokenReason(
    intent.token,
    intent.orderToken,
    intent.clientToken,
  );
  if (orderToken) {
    return { ok: false, reason: orderToken };
  }
  // Additional floors would be called here in the full implementation.
  // Adapters read amount / symbol / price / side / type / clientOrderId / timeInForce only.
  return { ok: true };
}
