import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FixFeedback } from './fix-feedback.entity';

@Injectable()
export class FixFeedbackService {
  private optionalTableUnavailable = false;

  constructor(
    @InjectRepository(FixFeedback)
    private feedbackRepo: Repository<FixFeedback>,
  ) {}

  async recordFeedback(data: Partial<FixFeedback>): Promise<FixFeedback | null> {
    if (this.optionalTableUnavailable) {
      return null;
    }

    try {
      const feedback = this.feedbackRepo.create(data);
      return await this.feedbackRepo.save(feedback);
    } catch (error) {
      if (this.isMissingOptionalTableError(error)) {
        this.optionalTableUnavailable = true;
        return null;
      }

      throw error;
    }
  }

  /**
   * §291 (DB-5) / §292 — LEARNED FIXES ARE NOT SHARED ACROSS TENANTS, AND CANNOT BE.
   *
   * ==================== WHAT THIS USED TO DO ====================
   *
   * It selected every approved `fix_feedback` row in a category, across EVERY tenant, counted the
   * remediation titles, and returned any title used twice or more. Those titles are then placed at
   * the TOP of the corrective actions HazLenz proposes
   * (`ActionEngineService.generateActionsFromReport`), so one customer's remediation wording could
   * be suggested verbatim to another customer.
   *
   * That is the same defect family as DB-4 and a more serious one: DB-4 leaked INFLUENCE (an
   * escalation flag); this leaked CONTENT.
   *
   * ==================== WHY IT RETURNS NOTHING, AND TAKES NO SCOPE ====================
   *
   * `fix_feedback` carries no owner. It has `report_id`, `category`, two jsonb blobs and
   * `approved`, and nothing else. Worse, `report_id` is not reliably a report at all:
   * `OutcomeService` writes a corrective ACTION id into it. So there is no correct scoping
   * predicate available over this schema -- not a hard one, not an approximate one, none.
   *
   * §291 first added an OPTIONAL `scope` parameter and returned early when it was absent. That was
   * wrong, and §292 removed it. The query underneath was never scoped, so the parameter was a
   * fail-closed guard that would have become FAIL-OPEN the moment any caller supplied a scope --
   * the caller would believe it had asked for one workspace and would receive every workspace.
   * A safety guard that inverts when someone starts using it is worse than no guard, because it
   * reads as protection.
   *
   * So the capability is closed at the only place it can be closed honestly: there is no way to
   * ASK for cross-tenant data, because there is no parameter to ask with.
   *
   * In production this changes nothing observable: `fix_feedback` has zero rows and has never had
   * any, so this method has never once returned a learned fix.
   *
   * ==================== WHAT WOULD MAKE IT WORK, AND WHY THAT IS NOT DONE HERE ====================
   *
   * Workspace-scoped learning needs a workspace column on `fix_feedback`, populated at write time,
   * and a scope threaded from the HazLenz analysis pipeline, which today carries none. That is a
   * migration plus a pipeline change, and it is a product decision about whether the outcome
   * learning loop is a v1 capability at all. It is registered as DB-5 and is not taken here.
   *
   * WRITES ARE RETAINED. The signal is real and a future scoped implementation will want it.
   */
  async findLearnedFix(_category: string): Promise<string[]> {
    return [];
  }

  private isMissingOptionalTableError(error: unknown): boolean {
    const candidate = error as { code?: string; message?: string };
    return (
      candidate?.code === "42P01" ||
      String(candidate?.message || "").includes('relation "fix_feedback" does not exist')
    );
  }
}
