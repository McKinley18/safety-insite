import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DecisionGovernanceLog } from './decision-governance.entity';
import { FixFeedbackService } from '../intelligence/fix-feedback.service';

@Injectable()
export class DecisionGovernanceService {
  constructor(
    @InjectRepository(DecisionGovernanceLog)
    private governanceRepo: Repository<DecisionGovernanceLog>,
    private feedbackService: FixFeedbackService,
  ) {}

  async logDecision(data: Partial<DecisionGovernanceLog>) {
    const entry = this.governanceRepo.create(data);
    return await this.governanceRepo.save(entry);
  }

  async finalizeDecision(reportId: string, finalOutcome: "accepted" | "modified" | "rejected", humanDecision: any) {
    const log = await this.governanceRepo.findOne({ where: { reportId } });
    if (!log) return;

    log.userReviewed = true;
    log.finalOutcome = finalOutcome;
    log.finalHumanDecision = humanDecision;
    await this.governanceRepo.save(log);

    // 🔷 LEARNING VALIDATION FILTER
    const shouldLearn = log.userReviewed && 
                       (finalOutcome === "accepted" || finalOutcome === "modified") &&
                       log.confidence > 0.7 && 
                       !log.overrideApplied;

    if (shouldLearn) {
        await this.feedbackService.recordFeedback({
            reportId: log.reportId,
            category: log.predictedCategory,
            originalSuggestion: log.originalAiDecision,
            userAction: humanDecision,
            approved: true
        });
    }
  }

  async generateGovernanceReport() {
    const all = await this.governanceRepo.find();
    const total = all.length;
    
    const autoApproved = all.filter(d => d.userReviewed === false).length;
    const overrides = all.filter(d => d.overrideApplied === true).length;
    const lowConfidence = all.filter(d => d.confidence < 0.6).length;
    
    // Anomaly Detection: Track disagreement
    const modifications = all.filter(d => d.finalOutcome === 'modified').length;

    console.log("\n=== DECISION GOVERNANCE REPORT ===\n");
    console.log(`Auto Decisions: ${((autoApproved / total) * 100).toFixed(1)}%`);
    console.log(`Human Overrides: ${((overrides / total) * 100).toFixed(1)}%`);
    console.log(`Low Confidence Cases: ${((lowConfidence / total) * 100).toFixed(1)}%`);
    console.log(`Drift Alerts: ${modifications > (total * 0.2) ? "YES" : "NO"}`);

    return {
        autoApprovedPct: (autoApproved / total) * 100,
        overridePct: (overrides / total) * 100,
        lowConfidencePct: (lowConfidence / total) * 100,
        driftAlert: modifications > (total * 0.2)
    };
  }
}
