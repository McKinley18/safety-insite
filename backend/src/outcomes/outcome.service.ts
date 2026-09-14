import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outcome } from './outcome.entity';
import { FixFeedbackService } from '../intelligence/fix-feedback.service';

/**
 * §291 (DB-4) — WHICH WORKSPACE'S HISTORY MAY INFLUENCE THIS DECISION.
 *
 * The product has exactly one definition of "workspace" and it is not invented here: an
 * organization account is scoped by `organizationId`; a personal account is scoped by
 * `organizationId IS NULL` together with `ownerUserId`. That is the rule
 * `CorrectiveActionsService.buildFilter` applies to every list, read and mutation of a corrective
 * action, and recurrence now applies the identical rule to the history it counts.
 *
 * It is REQUIRED, not optional, and there is no "unscoped" variant. A recurrence figure computed
 * without a workspace is not a weaker answer, it is a different and wrong one, so the type system
 * refuses to express it.
 */
export interface WorkspaceScope {
  readonly organizationId: string | null;
  readonly ownerUserId: string;
}

@Injectable()
export class OutcomeService {
  constructor(
    @InjectRepository(Outcome)
    private outcomeRepo: Repository<Outcome>,
    private feedbackService: FixFeedbackService,
  ) {}

  private getBaseConfidence(method: string): number {
    switch (method) {
      case 'FOLLOW_UP_INSPECTION': return 0.9;
      case 'PHOTO_EVIDENCE': return 0.7;
      case 'SUPERVISOR_SIGNOFF': return 0.6;
      default: return 0.5;
    }
  }

  async recordOutcome(data: Partial<Outcome> & { location: string }, scope: WorkspaceScope) {
    const now = new Date();
    const recurrenceDetected = await this.checkRecurrence(data.category!, now, scope);

    // 🔷 1. Base Confidence
    let confidence = this.getBaseConfidence(data.verificationMethod || '');

    // 🔷 2. Time-based Boost
    const windowDays = data.observationWindowDays || 0;
    if (windowDays >= 30) confidence += 0.3;
    else if (windowDays >= 14) confidence += 0.2;
    else if (windowDays >= 7) confidence += 0.1;

    // 🔷 3. Exposure Weighting
    const loc = data.location.toLowerCase();
    const highExposure = ['entrance', 'production', 'traffic'];
    const exposureWeight = highExposure.some(e => loc.includes(e)) ? 1.2 : 0.8;
    confidence *= exposureWeight;

    // 🔷 4. False Success Protection
    if (data.inspectionsPerformed === 0 || windowDays < 7) {
      confidence = Math.min(confidence, 0.6);
    }

    confidence = Math.min(Math.max(confidence, 0), 1.0);

    // 🔷 5. Classification
    let verificationStatus: 'VERIFIED_STRONG' | 'VERIFIED_MODERATE' | 'WEAK_VALIDATION' = 'WEAK_VALIDATION';
    if (confidence > 0.85) verificationStatus = 'VERIFIED_STRONG';
    else if (confidence >= 0.6) verificationStatus = 'VERIFIED_MODERATE';

    const outcome = this.outcomeRepo.create({
      ...data,
      recurrenceDetected,
      verificationConfidence: confidence,
      verificationStatus,
    });

    const saved = await this.outcomeRepo.save(outcome);

    /**
     * 🔷 6. Learning Filter Update.
     *
     * §291 (DB-5). This write is retained because the signal is real, but nothing reads it across
     * a workspace boundary any more: `FixFeedbackService.findLearnedFix` is fail-closed and
     * returns nothing without a workspace scope, which `fix_feedback` currently has nowhere to
     * store. See that service for the full reasoning and the registered decision.
     */
    if (!recurrenceDetected && confidence > 0.75) {
      await this.feedbackService.recordFeedback({
        reportId: saved.actionId,
        category: saved.category,
        originalSuggestion: saved.originalRecommendation,
        userAction: saved.userActionTaken,
        approved: true,
      });
    }

    return saved;
  }

  /**
   * §291 (DB-4) — RECURRENCE IS COUNTED WITHIN ONE WORKSPACE, NEVER ACROSS TENANTS.
   *
   * ==================== THE DEFECT THIS REPLACES ====================
   *
   * This method used to be:
   *
   *     this.outcomeRepo.count({ where: { category, completionTimestamp: Between(a, b) } })
   *
   * `outcomes` carries no owner of its own -- no tenantId, no organizationId, no ownerUserId --
   * so that count ranged over EVERY tenant's history. Its result sets `recurrenceDetected`, and
   * `CorrectiveActionsService.recordClosureIntelligence` escalates the action to `urgent` on the
   * strength of it. One customer closing a "Machine guarding" action could therefore have their
   * action escalated because a DIFFERENT customer had closed a similar one three weeks earlier.
   *
   * §288 recorded this as contained on the grounds that no migration creates the `outcomes` table,
   * so the branch was unreachable. §289 read production and found the table present -- see the
   * provenance note in `outcome.entity.ts` -- so the branch is reachable and the containment
   * argument was false. This is the repair rather than another containment claim.
   *
   * ==================== WHY THE SCOPE COMES FROM THE ACTION ====================
   *
   * `outcomes` has no ownership column, and §291 directs that scoping use an existing
   * AUTHORITATIVE ownership relationship rather than an invented one. The authoritative
   * relationship is `outcomes."actionId" -> corrective_actions.id`: every outcome row is written
   * by `recordClosureIntelligence` from exactly one corrective action, and that action carries the
   * organization and owner the rest of the product already scopes by.
   *
   * So the count joins through the action and applies the product's own workspace predicate. No
   * column was added to `outcomes` to achieve it, which matters because that table sits outside
   * the migration lineage and must not be reshaped casually.
   *
   * `"actionId"` is `character varying` while `corrective_actions.id` is `uuid`, so the join casts
   * explicitly. A row whose `actionId` is not a well-formed uuid cannot match any action and is
   * therefore counted for nobody -- which is the correct failure direction.
   */
  private async checkRecurrence(
    category: string,
    completionDate: Date,
    scope: WorkspaceScope,
  ): Promise<boolean> {
    const thirtyDaysAgo = new Date(completionDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(completionDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const query = this.outcomeRepo
      .createQueryBuilder('outcome')
      .innerJoin(
        'corrective_actions',
        'action',
        // The cast is deliberate and the regex guard is what makes it safe: a malformed actionId
        // would otherwise raise `invalid input syntax for type uuid` and turn a closure into a 500.
        `outcome."actionId" ~ '^[0-9a-fA-F-]{36}$' AND action.id = CAST(outcome."actionId" AS uuid)`,
      )
      .where('outcome.category = :category', { category })
      .andWhere('outcome."completionTimestamp" BETWEEN :from AND :to', {
        from: thirtyDaysAgo,
        to: sevenDaysAgo,
      });

    if (scope.organizationId) {
      query.andWhere('action."organizationId" = :organizationId', {
        organizationId: scope.organizationId,
      });
    } else {
      // A personal workspace is (no organization) AND (this owner). Both halves are required:
      // `ownerUserId` alone would let a personal account see its own rows that had since been
      // moved into an organization, and `organizationId IS NULL` alone would pool every personal
      // account in the system into one shared history.
      query
        .andWhere('action."organizationId" IS NULL')
        .andWhere('action."ownerUserId" = :ownerUserId', { ownerUserId: scope.ownerUserId });
    }

    return (await query.getCount()) > 0;
  }

  async generateOutcomeReport() {
    const all = await this.outcomeRepo.find();
    const total = all.length;
    if (total === 0) return;

    const strong = all.filter(o => o.verificationStatus === 'VERIFIED_STRONG').length;
    const moderate = all.filter(o => o.verificationStatus === 'VERIFIED_MODERATE').length;
    const weak = all.filter(o => o.verificationStatus === 'WEAK_VALIDATION').length;

    console.log('\n=== VERIFICATION CONFIDENCE REPORT ===\n');
    console.log(`Strong Validation: ${((strong / total) * 100).toFixed(1)}%`);
    console.log(`Moderate Validation: ${((moderate / total) * 100).toFixed(1)}%`);
    console.log(`Weak Validation: ${((weak / total) * 100).toFixed(1)}%`);

    return { strong, moderate, weak };
  }
}
