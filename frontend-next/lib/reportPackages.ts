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
  includesSafeScopeSummary: boolean;
  includesSafeScopeTraceability: boolean;
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
        "Operational report package with team accountability, assignments, trend intelligence, SafeScope traceability, and company-level review support.",
      includesExecutiveSummary: true,
      includesSafeScopeSummary: true,
      includesSafeScopeTraceability: true,
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
        "Professional safety report with SafeScope confidence, evidence gaps, standards rationale, corrective action context, and supervisor review signals.",
      includesExecutiveSummary: true,
      includesSafeScopeSummary: true,
      includesSafeScopeTraceability: false,
      includesEvidenceGaps: true,
      includesConfidence: true,
      includesRepeatIntelligence: true,
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
      "Clean inspection record with findings, locations, risk ratings, selected standards, corrective actions, photos, and human-review notice.",
    includesExecutiveSummary: false,
    includesSafeScopeSummary: false,
    includesSafeScopeTraceability: false,
    includesEvidenceGaps: false,
    includesConfidence: false,
    includesRepeatIntelligence: false,
    includesCompanyMetadata: false,
    includesAssignments: false,
    includesTrendSummary: false,
  };
}
