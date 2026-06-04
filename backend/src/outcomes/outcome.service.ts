import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Outcome } from './outcome.entity';
import { FixFeedbackService } from '../intelligence/fix-feedback.service';

@Injectable()
export class OutcomeService {
  constructor(
    @InjectRepository(Outcome)
    private outcomeRepo: Repository<Outcome>,
    private feedbackService: FixFeedbackService,
  ) {}

  private getBaseConfidence(method: string): number {
    switch (method) {
      case "FOLLOW_UP_INSPECTION": return 0.9;
      case "PHOTO_EVIDENCE": return 0.7;
      case "SUPERVISOR_SIGNOFF": return 0.6;
      default: return 0.5;
    }
  }

  async recordOutcome(data: Partial<Outcome> & { location: string }) {
    const now = new Date();
    const recurrenceDetected = await this.checkRecurrence(data.category!, now);
    
    // 🔷 1. Base Confidence
    let confidence = this.getBaseConfidence(data.verificationMethod || '');
    
    // 🔷 2. Time-based Boost
    const windowDays = data.observationWindowDays || 0;
    if (windowDays >= 30) confidence += 0.3;
    else if (windowDays >= 14) confidence += 0.2;
    else if (windowDays >= 7) confidence += 0.1;

    // 🔷 3. Exposure Weighting
    const loc = data.location.toLowerCase();
    const highExposure = ["entrance", "production", "traffic"];
    const exposureWeight = highExposure.some(e => loc.includes(e)) ? 1.2 : 0.8;
    confidence *= exposureWeight;

    // 🔷 4. False Success Protection
    if (data.inspectionsPerformed === 0 || windowDays < 7) {
        confidence = Math.min(confidence, 0.6);
    }
    
    confidence = Math.min(Math.max(confidence, 0), 1.0);

    // 🔷 5. Classification
    let verificationStatus: "VERIFIED_STRONG" | "VERIFIED_MODERATE" | "WEAK_VALIDATION" = "WEAK_VALIDATION";
    if (confidence > 0.85) verificationStatus = "VERIFIED_STRONG";
    else if (confidence >= 0.6) verificationStatus = "VERIFIED_MODERATE";

    const outcome = this.outcomeRepo.create({
      ...data,
      recurrenceDetected,
      verificationConfidence: confidence,
      verificationStatus
    });

    const saved = await this.outcomeRepo.save(outcome);

    // 🔷 6. Learning Filter Update
    if (!recurrenceDetected && confidence > 0.75) {
        await this.feedbackService.recordFeedback({
            reportId: saved.actionId,
            category: saved.category,
            originalSuggestion: saved.originalRecommendation,
            userAction: saved.userActionTaken,
            approved: true
        });
    }

    return saved;
  }

  private async checkRecurrence(category: string, completionDate: Date): Promise<boolean> {
    const thirtyDaysAgo = new Date(completionDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(completionDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const count = await this.outcomeRepo.count({
      where: {
        category,
        completionTimestamp: Between(thirtyDaysAgo, sevenDaysAgo)
      }
    });
    return count > 0;
  }

  async generateOutcomeReport() {
    const all = await this.outcomeRepo.find();
    const total = all.length;
    if (total === 0) return;

    const strong = all.filter(o => o.verificationStatus === 'VERIFIED_STRONG').length;
    const moderate = all.filter(o => o.verificationStatus === 'VERIFIED_MODERATE').length;
    const weak = all.filter(o => o.verificationStatus === 'WEAK_VALIDATION').length;

    console.log("\n=== VERIFICATION CONFIDENCE REPORT ===\n");
    console.log(`Strong Validation: ${((strong / total) * 100).toFixed(1)}%`);
    console.log(`Moderate Validation: ${((moderate / total) * 100).toFixed(1)}%`);
    console.log(`Weak Validation: ${((weak / total) * 100).toFixed(1)}%`);

    return { strong, moderate, weak };
  }
}
