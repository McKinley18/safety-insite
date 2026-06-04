export class ClassificationResponseDto {
  id: string;
  reportId: string;
  hazardCategoryCode: string;
  severityLevel: string;
  confidenceScore: number;
  requiresHumanReview: boolean;
  reasoningSummary: string;
}
