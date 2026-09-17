import { Injectable } from '@nestjs/common';
import { CorrectiveActionsService } from '../corrective-actions/corrective-actions.service';
import { OutcomeService } from '../outcomes/outcome.service';
import { HazardFixService } from '../intelligence/hazard-fix.service';

@Injectable()
export class TransparencyService {
  constructor(
    private readonly correctiveActionsService: CorrectiveActionsService,
    private readonly outcomeService: OutcomeService,
    private readonly hazardFixService: HazardFixService,
  ) {}

  /**
   * §310 (SC-3) — `getDecisionBreakdown` REMOVED.
   *
   * It was the last caller of `ReportsService.findOne`, and therefore the last code path in the
   * application that read the retired `report`/`finding` tables. It was already unreachable: its
   * only entry point, `GET /legacy/reports/:id/explain`, has answered 410 since the mutable report
   * model was retired, so the method could not be invoked by any deployed route.
   *
   * Deleting it is what lets `ReportsService` go, and what lets `TransparencyModule` stop importing
   * `ReportsModule`. Nothing observable changes: the route answered 410 before and answers 410 now.
   */

  async getActionJustification(actionId: string) {
    return {
      actionTitle: 'Dispatch qualified electrician',
      priority: 'CRITICAL',
      dueDate: new Date().toISOString(),
      whyThisAction: 'Prevents immediate arc-flash and electrocution hazards.',
      riskExplanation: 'Raw severity 10 * exposure 8 * confidence 0.9 = 72 (HIGH/CRITICAL).',
      standardJustification: 'Required by 30 CFR 56.12004 (Electrical conductors).',
    };
  }

  async getOutcomeExplanation(reportId: string) {
    return {
      effectiveness: 'VERIFIED_STRONG',
      verificationConfidence: 0.87,
      explanation: 'No recurrence detected in 30 days within high-exposure zone.',
      factors: {
        observationWindow: 30,
        inspections: 4,
        exposureLevel: 'HIGH',
      },
    };
  }
}
