export interface ReportSection {
  title: string;
  content: string;
  advisoryDisclaimer: string;
}

export interface GovernanceReportAdapterOutput {
  safetyFindingSummary: ReportSection;
  confidenceAndEvidenceSummary: ReportSection;
  missingEvidenceQuestions: ReportSection;
  reviewerRequiredSummary: ReportSection;
  standardsApplicabilitySummary: ReportSection;
  correctiveActionSummary: ReportSection;
  advisoryDisclaimer: string;
  auditAppendixSummary: ReportSection;
}
