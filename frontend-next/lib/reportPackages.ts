import type { PlanCode } from "@/lib/planEntitlements";

export type ReportPackageCode =
  | "field_report"
  | "professional_report"
  | "company_compliance_package";

export type ReportPackageConfig = {
  code: ReportPackageCode;
  label: string;
  shortLabel: string;
  description: string;
  includesExecutiveSummary: boolean;
  includesReviewCoreSummary: boolean;
  includesReviewCoreTraceability: boolean;
  includesEvidenceGaps: boolean;
  includesConfidence: boolean;
  includesRepeatIntelligence: boolean;
  includesCompanyMetadata: boolean;
  includesAssignments: boolean;
  includesTrendSummary: boolean;
};

export function getReportPackageForPlan(
  planCode?: string | PlanCode,
): ReportPackageConfig {
  if (planCode === "company") {
    return {
      code: "company_compliance_package",
      label: "Company Compliance Package",
      shortLabel: "Company",
      description:
        "Management-ready compliance package with company metadata, team accountability, assigned corrective actions, trend intelligence, repeat-finding history, and full ReviewCore traceability.",
      includesExecutiveSummary: true,
      includesReviewCoreSummary: true,
      includesReviewCoreTraceability: true,
      includesEvidenceGaps: true,
      includesConfidence: true,
      includesRepeatIntelligence: true,
      includesCompanyMetadata: true,
      includesAssignments: true,
      includesTrendSummary: true,
    };
  }

  if (planCode === "plus" || planCode === "pro") {
    return {
      code: "professional_report",
      label: "Professional Report",
      shortLabel: "Pro",
      description:
        "Professional single-inspection report with executive summary, ReviewCore confidence, evidence gaps, standards rationale, corrective action context, and supervisor review signals.",
      includesExecutiveSummary: true,
      includesReviewCoreSummary: true,
      includesReviewCoreTraceability: false,
      includesEvidenceGaps: true,
      includesConfidence: true,
      includesRepeatIntelligence: false,
      includesCompanyMetadata: false,
      includesAssignments: false,
      includesTrendSummary: false,
    };
  }

  return {
    code: "field_report",
    label: "Field Report",
    shortLabel: "Basic",
    description:
      "Clean field inspection record with findings, locations, risk ratings, selected standards, corrective actions, photos, and human-review notice.",
    includesExecutiveSummary: false,
    includesReviewCoreSummary: false,
    includesReviewCoreTraceability: false,
    includesEvidenceGaps: false,
    includesConfidence: false,
    includesRepeatIntelligence: false,
    includesCompanyMetadata: false,
    includesAssignments: false,
    includesTrendSummary: false,
  };
}
