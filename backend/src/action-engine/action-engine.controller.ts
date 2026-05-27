import { Controller, Post, Param, Headers, NotFoundException, Inject, forwardRef, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { ActionEngineService, ActionInput } from './action-engine.service';
import { ReportsService } from '../reports/reports.service';
import { CorrectiveActionsService } from '../corrective-actions/corrective-actions.service';

@UseGuards(JwtGuard)
@Controller('action-engine')
export class ActionEngineController {
  constructor(
    private readonly actionEngineService: ActionEngineService,
    
    @Inject(forwardRef(() => ReportsService))
    private readonly reportsService: ReportsService,
    
    private readonly correctiveActionsService: CorrectiveActionsService,
  ) {}

  @Post('generate/:reportId')
  async generateActions(
    @Param('reportId') reportId: string,
    @Headers('authorization') authHeader: string,
    @Req() req: Request & { user?: any },
  ) {
    // 1. Fetch Report within the authenticated user's organization scope.
    const report = await this.reportsService.findOne(reportId, req.user);
    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    const allSavedActions = [];

    // 2. Loop through findings to generate specific actions
    for (const finding of report.findings) {
        // Calculate dynamic risk if not stored
        const calculatedRisk = (finding.severity || 5) * (finding.likelihood || 5) * 2; // Scale to 100

        const actionInput: ActionInput = {
            id: report.id,
            category: finding.hazardCategory || "unknown",
            description: finding.hazard || finding.hazardCategory || "No description",
            riskScore: (finding as any).riskScore || calculatedRisk,
            riskLevel: (finding as any).riskLevel || (calculatedRisk > 75 ? "CRITICAL" : calculatedRisk > 50 ? "HIGH" : "MODERATE"),
            confidence: (finding as any).confidence || 0.90,
            patterns: (finding as any).patterns || [],
            location: report.site || "Facility Floor",
            override: (finding as any).overrideApplied || false,
        };

        const generatedActions = await this.actionEngineService.generateActionsFromReport(actionInput);

        for (const action of generatedActions) {
            const saved = await this.correctiveActionsService.create(authHeader, {
                title: action.title,
                description: action.description,
                priorityCode: action.priority,
                targetDate: action.dueDate,
                assignedToUserId: undefined, 
                category: action.category,
                originalSuggestion: action.originalSuggestion
            } as any);
            allSavedActions.push(saved);
        }
    }

    return {
      message: `Successfully generated ${allSavedActions.length} actions from report ${reportId}`,
      actions: allSavedActions,
    };
  }
}
