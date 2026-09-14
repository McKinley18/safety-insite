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
   * §291 (DB-5) — LEARNED FIXES ARE NOT SHARED ACROSS TENANTS, AND THIS IS FAIL-CLOSED.
   *
   * ==================== WHAT THIS USED TO DO ====================
   *
   * It selected every approved `fix_feedback` row in a category, across EVERY tenant, counted the
   * remediation titles, and returned any title used twice or more. Those titles are then placed at
   * the TOP of the corrective actions HazLenz proposes (`ActionEngineService.generateActionsFromReport`),
   * so one customer's remediation wording could be suggested verbatim to another customer.
   *
   * That is the same defect family as DB-4 and a more serious one: DB-4 leaked INFLUENCE (an
   * escalation flag), this leaked CONTENT.
   *
   * ==================== WHY IT IS CLOSED RATHER THAN SCOPED ====================
   *
   * `fix_feedback` carries no owner -- it has `report_id`, `category`, two jsonb blobs and
   * `approved`, and nothing else -- so there is no authoritative ownership relationship to scope
   * by. Worse, `report_id` is not even reliably a report: `OutcomeService` writes a corrective
   * ACTION id into it. So no correct scoping predicate exists over the current schema.
   *
   * The caller cannot supply a scope either: the only read path runs inside the HazLenz analysis
   * pipeline, which carries no workspace context, and threading one through that pipeline is a
   * large change §291 explicitly warns against making here.
   *
   * So the read is FAIL-CLOSED: without a workspace scope it returns nothing. In production this
   * is behaviour-preserving -- `fix_feedback` has zero rows and has never had any, so this method
   * has never once returned a learned fix -- while removing the cross-tenant path entirely.
   *
   * Writes are RETAINED. The signal is real and a future workspace-scoped implementation will
   * want it. Enabling that is a product decision, registered as DB-5: add a workspace column to
   * `fix_feedback`, populate it at write time, thread a scope to this read, and prove both
   * directions. Until then this returns nothing rather than something wrong.
   */
  async findLearnedFix(category: string, scope?: { organizationId: string | null; ownerUserId: string }): Promise<string[]> {
    if (this.optionalTableUnavailable) {
      return [];
    }

    if (!scope) {
      // No workspace, no cross-workspace suggestions. See the note above.
      return [];
    }

    try {
      const normalizedCategory = category.toLowerCase().trim();

      const entries = await this.feedbackRepo.find({
        where: { category: normalizedCategory, approved: true },
      });

      if (entries.length === 0) return [];

      const frequencyMap: Record<string, number> = {};
      entries.forEach((entry) => {
        const title = entry.userAction?.title;
        if (title) {
          frequencyMap[title] = (frequencyMap[title] || 0) + 1;
        }
      });

      return Object.entries(frequencyMap)
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .map(([title]) => title)
        .slice(0, 3);
    } catch (error) {
      if (this.isMissingOptionalTableError(error)) {
        this.optionalTableUnavailable = true;
        return [];
      }

      console.warn("Fix feedback lookup skipped.");
      return [];
    }
  }

  private isMissingOptionalTableError(error: unknown): boolean {
    const candidate = error as { code?: string; message?: string };
    return (
      candidate?.code === "42P01" ||
      String(candidate?.message || "").includes('relation "fix_feedback" does not exist')
    );
  }
}
