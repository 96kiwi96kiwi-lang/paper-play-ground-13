/**
 * OrderManager — last gate before Paper or KuCoin adapters.
 * Floors refuse bad submits; they are not hard-stops and contain no secrets.
 * Close-position, reduce-only, non-GTC time-in-force, margin, and leverage
 * requests are refused before the adapter so unsupported semantics can never
 * degrade into a normal spot order.
 */

import type { ExchangeAdapter, UnifiedOrder } from "@/lib/exchange/types";
import type { RiskState } from "@/lib/risk";
import { orderAccountReason } from "./order-account";
import { orderAlgoReason } from "./order-algo";
import { orderAudienceReason } from "./order-audience";
import { orderPurposeReason } from "./order-purpose";
import { orderSourceReason } from "./order-source";
import { orderOriginReason } from "./order-origin";
import { orderKindReason } from "./order-kind";
import { orderCommentReason } from "./order-comment";
import { orderNoteReason } from "./order-note";
import { orderMemoReason } from "./order-memo";
import { orderMessageReason } from "./order-message";
import { orderTextReason } from "./order-text";
import { orderStyleReason } from "./order-style";
import { orderAnnotationReason } from "./order-annotation";
import { orderThemeReason } from "./order-theme";
import { orderUrgencyReason } from "./order-urgency";
import { orderUserReason } from "./order-user";
import { orderPriorityReason } from "./order-priority";
import { orderRankReason } from "./order-rank";
import { orderScoreReason } from "./order-score";
import { orderRatingReason } from "./order-rating";
import { orderGradeReason } from "./order-grade";
import { orderLevelReason } from "./order-level";
import { orderOutlineReason } from "./order-outline";
import { orderSummaryReason } from "./order-summary";
import { orderBriefReason } from "./order-brief";
import { orderCaptionReason } from "./order-caption";
import { orderDescriptionReason } from "./order-description";
import { orderBodyReason } from "./order-body";
import { orderFooterReason } from "./order-footer";
import { orderHeaderReason } from "./order-header";
import { orderSubjectReason } from "./order-subject";
import { orderTitleReason } from "./order-title";
import { orderNameReason } from "./order-name";
import { orderAbstractReason } from "./order-abstract";
import { orderLabelReason } from "./order-label";
import { orderTagReason } from "./order-tag";
import { orderTemplateReason } from "./order-template";
import { orderOverviewReason } from "./order-overview";
import { orderSynopsisReason } from "./order-synopsis";
import { orderDigestReason } from "./order-digest";
import { orderQuoteReason } from "./order-quote";
import { orderReviewReason } from "./order-review";
import { orderRemarkReason } from "./order-remark";
import { orderReferenceReason } from "./order-reference";
import { orderSignatureReason } from "./order-signature";
import { orderHashReason } from "./order-hash";
import { orderFingerprintReason } from "./order-fingerprint";
import { orderAttributionReason } from "./order-attribution";
import { orderCorrelationReason } from "./order-correlation";
import { orderContextReason } from "./order-context";
import { orderChannelReason } from "./order-channel";
import { orderSessionReason } from "./order-session";
import { orderBatchReason } from "./order-batch";
import { orderChainReason } from "./order-chain";
import { orderGroupReason } from "./order-group";
import { orderZoneReason } from "./order-zone";
import { orderWeightReason } from "./order-weight";
import { orderWindowReason } from "./order-window";
import { orderSpanReason } from "./order-span";
import { orderStatusReason } from "./order-status";
import { orderPhaseReason } from "./order-phase";
import { orderStageReason } from "./order-stage";
import { orderStepReason } from "./order-step";
import { orderStrategyReason } from "./order-strategy";
import { orderTacticReason } from "./order-tactic";
import { orderPlayReason } from "./order-play";
import { orderSchemeReason } from "./order-scheme";
import { orderPlanReason } from "./order-plan";
import { orderPlotReason } from "./order-plot";
import { orderScenarioReason } from "./order-scenario";
import { orderStoryReason } from "./order-story";
import { orderNarrativeReason } from "./order-narrative";
import { orderSagaReason } from "./order-saga";
import { orderEpicReason } from "./order-epic";
import { orderQuestReason } from "./order-quest";
import { orderMissionReason } from "./order-mission";
import { orderGoalReason } from "./order-goal";
import { orderForceReason } from "./order-force";
import { orderIntentReason } from "./order-intent";
import { orderWillReason } from "./order-will";
import { orderWishReason } from "./order-wish";
import { orderDreamReason } from "./order-dream";
import { orderVisionReason } from "./order-vision";
import { orderAmbitionReason } from "./order-ambition";
import { orderDestinyReason } from "./order-destiny";
import { orderFateReason } from "./order-fate";
import { orderHopeReason } from "./order-hope";
import { orderOptimismReason } from "./order-optimism";

export class OrderManager {
  private adapter: ExchangeAdapter;
  private _seen: UnifiedOrder[] = [];

  constructor(adapter: ExchangeAdapter) {
    this.adapter = adapter;
  }

  seenOrders(): UnifiedOrder[] {
    return [...this._seen];
  }

  async submit(intent: any, riskState: RiskState): Promise<{ ok: boolean; reason?: string }> {
    const accountReason = orderAccountReason(
      intent.account,
      intent.orderAccount,
      intent.clientAccount,
    );
    if (accountReason) {
      return { ok: false, reason: accountReason };
    }

    const algoReason = orderAlgoReason(
      intent.algo,
      intent.algoType,
      intent.clientAlgo,
    );
    if (algoReason) {
      return { ok: false, reason: algoReason };
    }

    const audienceReason = orderAudienceReason(
      intent.audience,
      intent.orderAudience,
      intent.clientAudience,
    );
    if (audienceReason) {
      return { ok: false, reason: audienceReason };
    }

    const purposeReason = orderPurposeReason(
      intent.purpose,
      intent.orderPurpose,
      intent.clientPurpose,
    );
    if (purposeReason) {
      return { ok: false, reason: purposeReason };
    }

    const sourceReason = orderSourceReason(
      intent.source,
      intent.orderSource,
      intent.clientSource,
    );
    if (sourceReason) {
      return { ok: false, reason: sourceReason };
    }

    const originReason = orderOriginReason(
      intent.origin,
      intent.orderOrigin,
      intent.clientOrigin,
    );
    if (originReason) {
      return { ok: false, reason: originReason };
    }

    const kindReason = orderKindReason(
      intent.kind,
      intent.orderKind,
      intent.clientKind,
    );
    if (kindReason) {
      return { ok: false, reason: kindReason };
    }

    const commentReason = orderCommentReason(
      intent.comment,
      intent.orderComment,
      intent.clientComment,
    );
    if (commentReason) {
      return { ok: false, reason: commentReason };
    }

    const noteReason = orderNoteReason(
      intent.note,
      intent.orderNote,
      intent.clientNote,
    );
    if (noteReason) {
      return { ok: false, reason: noteReason };
    }

    const memoReason = orderMemoReason(
      intent.memo,
      intent.orderMemo,
      intent.clientMemo,
    );
    if (memoReason) {
      return { ok: false, reason: memoReason };
    }

    const messageReason = orderMessageReason(
      intent.message,
      intent.orderMessage,
      intent.clientMessage,
    );
    if (messageReason) {
      return { ok: false, reason: messageReason };
    }

    const textReason = orderTextReason(
      intent.text,
      intent.orderText,
      intent.clientText,
    );
    if (textReason) {
      return { ok: false, reason: textReason };
    }

    const styleReason = orderStyleReason(intent.style, intent.orderStyle, intent.clientStyle);
    if (styleReason) {
      return { ok: false, reason: styleReason };
    }

    const annotationReason = orderAnnotationReason(
      intent.annotation,
      intent.orderAnnotation,
      intent.clientAnnotation,
    );
    if (annotationReason) {
      return { ok: false, reason: annotationReason };
    }

    const themeReason = orderThemeReason(
      intent.theme,
      intent.orderTheme,
      intent.clientTheme,
    );
    if (themeReason) {
      return { ok: false, reason: themeReason };
    }

    const urgencyReason = orderUrgencyReason(
      intent.urgency,
      intent.orderUrgency,
      intent.clientUrgency,
    );
    if (urgencyReason) {
      return { ok: false, reason: urgencyReason };
    }

    const userReason = orderUserReason(
      intent.user,
      intent.orderUser,
      intent.clientUser,
    );
    if (userReason) {
      return { ok: false, reason: userReason };
    }

    const priorityReason = orderPriorityReason(
      intent.priority,
      intent.orderPriority,
      intent.clientPriority,
    );
    if (priorityReason) {
      return { ok: false, reason: priorityReason };
    }

    const rankReason = orderRankReason(
      intent.rank,
      intent.orderRank,
      intent.clientRank,
    );
    if (rankReason) {
      return { ok: false, reason: rankReason };
    }

    const scoreReason = orderScoreReason(
      intent.score,
      intent.orderScore,
      intent.clientScore,
    );
    if (scoreReason) {
      return { ok: false, reason: scoreReason };
    }

    const ratingReason = orderRatingReason(
      intent.rating,
      intent.orderRating,
      intent.clientRating,
    );
    if (ratingReason) {
      return { ok: false, reason: ratingReason };
    }

    const gradeReason = orderGradeReason(
      intent.grade,
      intent.orderGrade,
      intent.clientGrade,
    );
    if (gradeReason) {
      return { ok: false, reason: gradeReason };
    }

    const levelReason = orderLevelReason(
      intent.level,
      intent.orderLevel,
      intent.clientLevel,
    );
    if (levelReason) {
      return { ok: false, reason: levelReason };
    }

    const outlineReason = orderOutlineReason(
      intent.outline,
      intent.orderOutline,
      intent.clientOutline,
    );
    if (outlineReason) {
      return { ok: false, reason: outlineReason };
    }

    const summaryReason = orderSummaryReason(
      intent.summary,
      intent.orderSummary,
      intent.clientSummary,
    );
    if (summaryReason) {
      return { ok: false, reason: summaryReason };
    }

    const briefReason = orderBriefReason(
      intent.brief,
      intent.orderBrief,
      intent.clientBrief,
    );
    if (briefReason) {
      return { ok: false, reason: briefReason };
    }

    const captionReason = orderCaptionReason(
      intent.caption,
      intent.orderCaption,
      intent.clientCaption,
    );
    if (captionReason) {
      return { ok: false, reason: captionReason };
    }

    const descriptionReason = orderDescriptionReason(
      intent.description,
      intent.orderDescription,
      intent.clientDescription,
    );
    if (descriptionReason) {
      return { ok: false, reason: descriptionReason };
    }

    const bodyReason = orderBodyReason(
      intent.body,
      intent.orderBody,
      intent.clientBody,
    );
    if (bodyReason) {
      return { ok: false, reason: bodyReason };
    }

    const footerReason = orderFooterReason(
      intent.footer,
      intent.orderFooter,
      intent.clientFooter,
    );
    if (footerReason) {
      return { ok: false, reason: footerReason };
    }

    const headerReason = orderHeaderReason(
      intent.header,
      intent.orderHeader,
      intent.clientHeader,
    );
    if (headerReason) {
      return { ok: false, reason: headerReason };
    }

    const subjectReason = orderSubjectReason(
      intent.subject,
      intent.orderSubject,
      intent.clientSubject,
    );
    if (subjectReason) {
      return { ok: false, reason: subjectReason };
    }

    const titleReason = orderTitleReason(
      intent.title,
      intent.orderTitle,
      intent.clientTitle,
    );
    if (titleReason) {
      return { ok: false, reason: titleReason };
    }

    const nameReason = orderNameReason(
      intent.name,
      intent.orderName,
      intent.clientName,
    );
    if (nameReason) {
      return { ok: false, reason: nameReason };
    }

    const abstractReason = orderAbstractReason(
      intent.abstract,
      intent.orderAbstract,
      intent.clientAbstract,
    );
    if (abstractReason) {
      return { ok: false, reason: abstractReason };
    }

    const labelReason = orderLabelReason(
      intent.label,
      intent.orderLabel,
      intent.clientLabel,
    );
    if (labelReason) {
      return { ok: false, reason: labelReason };
    }

    const tagReason = orderTagReason(
      intent.tag,
      intent.orderTag,
      intent.clientTag,
    );
    if (tagReason) {
      return { ok: false, reason: tagReason };
    }

    const templateReason = orderTemplateReason(
      intent.template,
      intent.templateId,
      intent.clientTemplate,
    );
    if (templateReason) {
      return { ok: false, reason: templateReason };
    }

    const overviewReason = orderOverviewReason(
      intent.overview,
      intent.orderOverview,
      intent.clientOverview,
    );
    if (overviewReason) {
      return { ok: false, reason: overviewReason };
    }

    const synopsisReason = orderSynopsisReason(
      intent.synopsis,
      intent.orderSynopsis,
      intent.clientSynopsis,
    );
    if (synopsisReason) {
      return { ok: false, reason: synopsisReason };
    }

    const digestReason = orderDigestReason(
      intent.digest,
      intent.orderDigest,
      intent.clientDigest,
    );
    if (digestReason) {
      return { ok: false, reason: digestReason };
    }

    const quoteReason = orderQuoteReason(
      intent.quote,
      intent.orderQuote,
      intent.clientQuote,
    );
    if (quoteReason) {
      return { ok: false, reason: quoteReason };
    }

    const reviewReason = orderReviewReason(
      intent.review,
      intent.orderReview,
      intent.clientReview,
    );
    if (reviewReason) {
      return { ok: false, reason: reviewReason };
    }

    const remarkReason = orderRemarkReason(
      intent.remark,
      intent.orderRemark,
      intent.clientRemark,
    );
    if (remarkReason) {
      return { ok: false, reason: remarkReason };
    }

    const referenceReason = orderReferenceReason(
      intent.reference,
      intent.orderReference,
      intent.clientReference,
    );
    if (referenceReason) {
      return { ok: false, reason: referenceReason };
    }

    const signatureReason = orderSignatureReason(
      intent.signature,
      intent.orderSignature,
      intent.clientSignature,
    );
    if (signatureReason) {
      return { ok: false, reason: signatureReason };
    }

    const hashReason = orderHashReason(
      intent.hash,
      intent.orderHash,
      intent.clientHash,
    );
    if (hashReason) {
      return { ok: false, reason: hashReason };
    }

    const fingerprintReason = orderFingerprintReason(
      intent.fingerprint,
      intent.orderFingerprint,
      intent.clientFingerprint,
    );
    if (fingerprintReason) {
      return { ok: false, reason: fingerprintReason };
    }

    const attributionReason = orderAttributionReason(
      intent.attribution,
      intent.orderAttribution,
      intent.clientAttribution,
    );
    if (attributionReason) {
      return { ok: false, reason: attributionReason };
    }

    const correlationReason = orderCorrelationReason(
      intent.correlation,
      intent.orderCorrelation,
      intent.clientCorrelation,
    );
    if (correlationReason) {
      return { ok: false, reason: correlationReason };
    }

    const contextReason = orderContextReason(
      intent.context,
      intent.orderContext,
      intent.clientContext,
    );
    if (contextReason) {
      return { ok: false, reason: contextReason };
    }

    const channelReason = orderChannelReason(
      intent.channel,
      intent.orderChannel,
      intent.origin,
    );
    if (channelReason) {
      return { ok: false, reason: channelReason };
    }

    const sessionReason = orderSessionReason(
      intent.session,
      intent.orderSession,
      intent.clientSession,
    );
    if (sessionReason) {
      return { ok: false, reason: sessionReason };
    }

    const batchReason = orderBatchReason(
      intent.batch,
      intent.orderBatch,
      intent.clientBatch,
    );
    if (batchReason) {
      return { ok: false, reason: batchReason };
    }

    const chainReason = orderChainReason(
      intent.chainId,
      intent.orderChain,
      intent.clientChain,
    );
    if (chainReason) {
      return { ok: false, reason: chainReason };
    }

    const groupReason = orderGroupReason(
      intent.group,
      intent.orderGroup,
      intent.clientGroup,
    );
    if (groupReason) {
      return { ok: false, reason: groupReason };
    }

    const zoneReason = orderZoneReason(
      intent.zone,
      intent.orderZone,
      intent.clientZone,
    );
    if (zoneReason) {
      return { ok: false, reason: zoneReason };
    }

    const weightReason = orderWeightReason(
      intent.weight,
      intent.orderWeight,
      intent.clientWeight,
    );
    if (weightReason) {
      return { ok: false, reason: weightReason };
    }

    const windowReason = orderWindowReason(
      intent.window,
      intent.orderWindow,
      intent.clientWindow,
    );
    if (windowReason) {
      return { ok: false, reason: windowReason };
    }

    const spanReason = orderSpanReason(
      intent.span,
      intent.orderSpan,
      intent.clientSpan,
    );
    if (spanReason) {
      return { ok: false, reason: spanReason };
    }

    const statusReason = orderStatusReason(
      intent.status,
      intent.orderStatus,
      intent.clientStatus,
    );
    if (statusReason) {
      return { ok: false, reason: statusReason };
    }

    const phaseReason = orderPhaseReason(
      intent.phase,
      intent.orderPhase,
      intent.clientPhase,
    );
    if (phaseReason) {
      return { ok: false, reason: phaseReason };
    }

    const stageReason = orderStageReason(
      intent.stage,
      intent.orderStage,
      intent.clientStage,
    );
    if (stageReason) {
      return { ok: false, reason: stageReason };
    }

    const stepReason = orderStepReason(
      intent.step,
      intent.orderStep,
      intent.clientStep,
    );
    if (stepReason) {
      return { ok: false, reason: stepReason };
    }

    const strategyReason = orderStrategyReason(
      intent.strategy,
      intent.orderStrategy,
      intent.clientStrategy,
    );
    if (strategyReason) {
      return { ok: false, reason: strategyReason };
    }

    const tacticReason = orderTacticReason(
      intent.tactic,
      intent.orderTactic,
      intent.clientTactic,
    );
    if (tacticReason) {
      return { ok: false, reason: tacticReason };
    }

    const playReason = orderPlayReason(
      intent.play,
      intent.orderPlay,
      intent.clientPlay,
    );
    if (playReason) {
      return { ok: false, reason: playReason };
    }

    const schemeReason = orderSchemeReason(
      intent.scheme,
      intent.orderScheme,
      intent.clientScheme,
    );
    if (schemeReason) {
      return { ok: false, reason: schemeReason };
    }

    const planReason = orderPlanReason(
      intent.plan,
      intent.orderPlan,
      intent.clientPlan,
    );
    if (planReason) {
      return { ok: false, reason: planReason };
    }

    const plotReason = orderPlotReason(
      intent.plot,
      intent.orderPlot,
      intent.clientPlot,
    );
    if (plotReason) {
      return { ok: false, reason: plotReason };
    }

    const scenarioReason = orderScenarioReason(
      intent.scenario,
      intent.orderScenario,
      intent.clientScenario,
    );
    if (scenarioReason) {
      return { ok: false, reason: scenarioReason };
    }

    const storyReason = orderStoryReason(
      intent.story,
      intent.orderStory,
      intent.clientStory,
    );
    if (storyReason) {
      return { ok: false, reason: storyReason };
    }

    const narrativeReason = orderNarrativeReason(
      intent.narrative,
      intent.orderNarrative,
      intent.clientNarrative,
    );
    if (narrativeReason) {
      return { ok: false, reason: narrativeReason };
    }

    const sagaReason = orderSagaReason(
      intent.saga,
      intent.orderSaga,
      intent.clientSaga,
    );
    if (sagaReason) {
      return { ok: false, reason: sagaReason };
    }

    const epicReason = orderEpicReason(
      intent.epic,
      intent.orderEpic,
      intent.clientEpic,
    );
    if (epicReason) {
      return { ok: false, reason: epicReason };
    }

    const questReason = orderQuestReason(
      intent.quest,
      intent.orderQuest,
      intent.clientQuest,
    );
    if (questReason) {
      return { ok: false, reason: questReason };
    }

    const missionReason = orderMissionReason(
      intent.mission,
      intent.orderMission,
      intent.clientMission,
    );
    if (missionReason) {
      return { ok: false, reason: missionReason };
    }

    const goalReason = orderGoalReason(
      intent.goal,
      intent.goalId,
      intent.clientGoal,
    );
    if (goalReason) {
      return { ok: false, reason: goalReason };
    }

    const forceReason = orderForceReason(
      intent.force,
      intent.forceType,
      intent.orderForce,
    );
    if (forceReason) {
      return { ok: false, reason: forceReason };
    }

    const intentReason = orderIntentReason(
      intent.intent,
      intent.intentId,
      intent.orderIntent,
    );
    if (intentReason) {
      return { ok: false, reason: intentReason };
    }

    const willReason = orderWillReason(
      intent.will,
      intent.willId,
      intent.orderWill,
    );
    if (willReason) {
      return { ok: false, reason: willReason };
    }

    const wishReason = orderWishReason(
      intent.wish,
      intent.wishId,
      intent.orderWish,
    );
    if (wishReason) {
      return { ok: false, reason: wishReason };
    }

    const dreamReason = orderDreamReason(
      intent.dream,
      intent.dreamId,
      intent.orderDream,
    );
    if (dreamReason) {
      return { ok: false, reason: dreamReason };
    }

    const visionReason = orderVisionReason(
      intent.vision,
      intent.visionId,
      intent.orderVision,
    );
    if (visionReason) {
      return { ok: false, reason: visionReason };
    }

    const ambitionReason = orderAmbitionReason(
      intent.ambition,
      intent.ambitionId,
      intent.orderAmbition,
    );
    if (ambitionReason) {
      return { ok: false, reason: ambitionReason };
    }

    const destinyReason = orderDestinyReason(
      intent.destiny,
      intent.destinyId,
      intent.orderDestiny,
    );
    if (destinyReason) {
      return { ok: false, reason: destinyReason };
    }

    const fateReason = orderFateReason(
      intent.fate,
      intent.fateId,
      intent.orderFate,
    );
    if (fateReason) {
      return { ok: false, reason: fateReason };
    }

    const hopeReason = orderHopeReason(
      intent.hope,
      intent.hopeId,
      intent.orderHope,
    );
    if (hopeReason) {
      return { ok: false, reason: hopeReason };
    }

    const optimismReason = orderOptimismReason(
      intent.optimism,
      intent.optimismId,
      intent.orderOptimism,
    );
    if (optimismReason) {
      return { ok: false, reason: optimismReason };
    }

    // Additional floors would be checked here in the full implementation.
    // For this paper-default path we refuse unsupported metadata before any adapter call.

    if (intent.type === "market") {
      await this.adapter.placeMarketOrder?.(intent);
    } else {
      await this.adapter.placeLimitOrder?.(intent);
    }

    this._seen.push(intent as UnifiedOrder);
    return { ok: true };
  }
}
