import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HazLenzAnalysis } from '../../inspection/entities/hazlenz-analysis.entity';
import { HumanReview } from '../../inspection/entities/human-review.entity';
import { deriveEffectiveDecision, type EffectiveDecision } from './expert-effective-decision';
import type { SettledEntry, SettlementDecision } from './expert-settlement-contract';

/**
 * §265 — THE ONE SERVICE EVERY DOWNSTREAM CONSUMER ASKS.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS ITS OWN SERVICE AND ITS OWN MODULE.
 *
 * §264 exposed `deriveEffectiveDecision` and put the only caller inside `ExpertAnalysisService`,
 * which lives in a module that imports `InspectionModule`. The first real downstream consumer is
 * finding finalization, which lives INSIDE `InspectionService` — so asking §264's caller would have
 * required `InspectionModule` to import the Expert product module that already imports it, and the
 * cycle would have been resolved by someone re-deriving authority locally. That is the exact
 * failure `deriveEffectiveDecision` exists to prevent, arriving through the module graph rather
 * than through carelessness.
 *
 * So the derivation and its one database lookup move here, into a leaf module that imports nothing
 * but the two repositories it reads. `ExpertAnalysisController` and `InspectionService` both ask
 * it. There is still exactly ONE implementation of "is there a settled conclusion here", and now
 * there is no module-shaped reason for a second one to appear.
 *
 * ---------------------------------------------------------------------------------------------
 * IT AUTHORIZES NOTHING AND IT READS NOTHING IT WAS NOT GIVEN.
 *
 * Every method takes an analysis, or an analysis id SCOPED TO AN OBSERVATION THE CALLER HAS
 * ALREADY AUTHORIZED. This service performs no tenant check, because a second implementation of
 * tenancy is precisely what §262 refused to create; callers reach it only after
 * `InspectionService.authorizeObservation` or `accessibleObservation` has answered.
 */
export const EXPERT_DOWNSTREAM_AUTHORITY_VERSION =
  'hazlenz.expert.265.downstream-authority.v1' as const;

/**
 * WHY A VERDICT AND NOT A BOOLEAN.
 *
 * A downstream consumer must be able to tell the customer WHY it will not finalize, and the four
 * "no conclusion" reasons mean four different things — wait for a person, the analysis was refused,
 * the analysis was refused with truth preserved, the Expert layer was unreachable. Returning a bare
 * false would force the caller to re-read `analysisState` to write its own message, which is the
 * re-derivation this whole layer exists to make unnecessary.
 */
export const DOWNSTREAM_AUTHORITY_REASONS = [
  /** No Expert conclusion is in play at all: no analysis cited, or a client-supplied one. */
  'NO_EXPERT_AUTHORITY_IN_PLAY',
  /** A server-authored Expert analysis carries a settled operational conclusion. */
  'EXPERT_CONCLUSION_SETTLED',
  /** A server-authored Expert analysis carries no settled operational conclusion. */
  'EXPERT_CONCLUSION_NOT_SETTLED',
] as const;
export type DownstreamAuthorityReason = (typeof DOWNSTREAM_AUTHORITY_REASONS)[number];

export interface DownstreamAuthorityVerdict {
  readonly version: typeof EXPERT_DOWNSTREAM_AUTHORITY_VERSION;
  readonly allowed: boolean;
  readonly reason: DownstreamAuthorityReason;
  /** The server-derived decision, where an Expert analysis was actually consulted. */
  readonly decision: EffectiveDecision | null;
  /** What the customer is told when `allowed` is false. Never a state name on its own. */
  readonly refusal: string | null;
}

const NO_AUTHORITY_IN_PLAY: DownstreamAuthorityVerdict = {
  version: EXPERT_DOWNSTREAM_AUTHORITY_VERSION,
  allowed: true,
  reason: 'NO_EXPERT_AUTHORITY_IN_PLAY',
  decision: null,
  refusal: null,
};

@Injectable()
export class ExpertEffectiveDecisionService {
  constructor(
    @InjectRepository(HazLenzAnalysis) private readonly analyses: Repository<HazLenzAnalysis>,
    @InjectRepository(HumanReview) private readonly reviews: Repository<HumanReview>,
  ) {}

  /**
   * THE AUTHORITATIVE CONSEQUENTIAL CONCLUSION FOR ONE ANALYSIS.
   *
   * Reads the settlement record where one exists and hands both to the pure derivation. It decides
   * nothing itself, so the rule stays testable without a database. Moved here from §264's
   * `ExpertAnalysisService.effectiveDecisionFor`, unchanged in behaviour.
   */
  async forAnalysis(analysis: HazLenzAnalysis): Promise<EffectiveDecision> {
    const settlementReview = analysis.settlementReviewId
      ? await this.reviews.findOne({
        where: { id: analysis.settlementReviewId, analysisId: analysis.id },
      })
      : null;
    const conclusion = settlementReview?.reviewedConclusion as
      { entries?: SettledEntry[] } | null | undefined;
    return deriveEffectiveDecision({
      analysisState: analysis.analysisState,
      settlement: settlementReview === null || settlementReview === undefined ? null : {
        decision: settlementReview.decision as SettlementDecision,
        entries: conclusion?.entries ?? [],
        reviewedByUserId: settlementReview.reviewedByUserId,
        createdAt: settlementReview.createdAt,
      },
    });
  }

  /**
   * §265 — THE DOWNSTREAM AUTHORITY GATE.
   *
   * ---------------------------------------------------------------------------------------------
   * IT IS SCOPED TO AN ANALYSIS THE CALLER ALREADY RESOLVED, AND IT NEVER WIDENS.
   *
   * The caller passes the analysis id its own record cites. This looks that row up within the same
   * observation and asks the one derivation about it. It does not search for "the current Expert
   * analysis" on the observation and it does not fall back to one: authority is analysis-specific,
   * exactly as §264's settlement refusal on a superseded analysis is.
   *
   * ---------------------------------------------------------------------------------------------
   * THE LEGACY DETERMINISTIC PATH IS UNTOUCHED, BY CONSTRUCTION.
   *
   * A finding whose review cites no analysis, or cites a `client_supplied` one, reaches
   * `NO_EXPERT_AUTHORITY_IN_PLAY` and is allowed — because no Expert conclusion is being consumed,
   * so there is nothing here to settle. §265 activates a gate on the Expert path; it does not
   * impose a new precondition on the customer-authoritative deterministic path, which would have
   * been a product change nobody authorized.
   *
   * ---------------------------------------------------------------------------------------------
   * THE RAW EXPERT PROPOSAL IS NEVER CONSULTED.
   *
   * This method reads `producer`, `analysisState` and the settlement row. It never opens
   * `resultSnapshot`, so it cannot prefer what HazLenz proposed over what a human settled — there
   * is no code path by which the proposal could reach the verdict.
   */
  async authorizeFindingFinalization(
    analysisId: string | null | undefined,
    observationId: string,
  ): Promise<DownstreamAuthorityVerdict> {
    if (!analysisId) return NO_AUTHORITY_IN_PLAY;

    const analysis = await this.analyses.findOne({ where: { id: analysisId, observationId } });
    if (!analysis) return NO_AUTHORITY_IN_PLAY;
    if (analysis.producer !== 'server_authored') return NO_AUTHORITY_IN_PLAY;

    const decision = await this.forAnalysis(analysis);
    if (decision.settledForUse) {
      return {
        version: EXPERT_DOWNSTREAM_AUTHORITY_VERSION,
        allowed: true,
        reason: 'EXPERT_CONCLUSION_SETTLED',
        decision,
        refusal: null,
      };
    }
    return {
      version: EXPERT_DOWNSTREAM_AUTHORITY_VERSION,
      allowed: false,
      reason: 'EXPERT_CONCLUSION_NOT_SETTLED',
      decision,
      // The derivation's own sentence, not a second one written here. A message composed at the
      // consumer would be a second opinion about what the state means.
      refusal: `This finding rests on an Expert analysis with no settled operational conclusion. ${decision.statement}`,
    };
  }
}
