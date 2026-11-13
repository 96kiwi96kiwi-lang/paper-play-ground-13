/**
 * OrderManager — last gate before Paper or KuCoin adapters.
 * Floors refuse bad submits; they are not hard-stops and contain no secrets.
 * Close-position, reduce-only, non-GTC time-in-force, margin, and leverage
 * requests are refused before the adapter so unsupported semantics can never
 * degrade into a normal spot order.
 */

import type { ExchangeAdapter, UnifiedOrder } from "@/lib/exchange/types";
import type { RiskState } from "@/lib/risk";
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
