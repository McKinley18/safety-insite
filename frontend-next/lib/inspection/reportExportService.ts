import { localExporter } from "@/lib/localExporter";
import {
  getSafeScopeReviewSummary,
  getFindingActionsForReview,
  getSafeScopeValidationStatus,
  formatSafeScopeValidationStatus,
  formatReviewDate,
} from "@/lib/inspection/reportReviewHelpers";

export async function runInspectionExport(input: {
  report: any;
  reportPackage: any;
  humanReviewConfirmed: boolean;
  setExportWarning: (msg: string) => void;
  formatReviewDate: (date: string) => string;
}) {
  const { report, reportPackage, humanReviewConfirmed, setExportWarning, formatReviewDate } = input;

  const currentFindings = report.findings || [];
  const safeScopeReviewSummary = getSafeScopeReviewSummary(currentFindings);

  if (!humanReviewConfirmed) {
    setExportWarning(
      "Confirm qualified-person review before exporting this report.",
    );
    return;
  }

  if (safeScopeReviewSummary.unvalidated > 0) {
    setExportWarning(
      `${safeScopeReviewSummary.unvalidated} HazLenz AI finding(s) still need snapshot validation. Export will continue only after you confirm qualified-person review.`,
    );
  } else {
    setExportWarning("");
  }

  const findings = (report.findings || []).map((finding: any) => ({
    category:
      finding.hazardCategory ||
      finding.safeScopeResult?.classification ||
      "Uncategorized",
    description: finding.description || "No description provided.",
    location: finding.location || report.siteLocation || "Field Inspection",
    severity: Number(finding.severity || 1),
    likelihood: Number(finding.likelihood || 1),
    standards:
      report.includeStandardsInReport === false
        ? []
        : finding.selectedStandards ||
        finding.standards ||
        finding.safeScopeResult?.suggestedStandards ||
        finding.safeScopeResult?.inspectionIntelligence?.candidateStandards ||
        finding.safeScopeResult?.needsMoreEvidenceStandards ||
        finding.safeScopeResult?.standardApplicability?.needsMoreEvidenceStandards ||
        (finding.safeScopeResult?.executiveJudgment?.topStandard
          ? [finding.safeScopeResult.executiveJudgment.topStandard]
          : []),
    correctiveActions: getFindingActionsForReview(
      finding,
      report.includeActionsInReport !== false,
    ),
    photos: report.includePhotosInReport === false ? [] : finding.photos || [],
    safeScopeValidationStatus: getSafeScopeValidationStatus(finding),
    safeScopeValidationStatusLabel: formatSafeScopeValidationStatus(
      getSafeScopeValidationStatus(finding),
    ),
    safeScopeResult:
      report.includeSafeScopeNotesInReport === false
        ? null
        : finding.safeScopeResult
          ? {
              ...finding.safeScopeResult,
              validationStatus: getSafeScopeValidationStatus(finding),
              validationStatusLabel: formatSafeScopeValidationStatus(
                getSafeScopeValidationStatus(finding),
              ),
            }
          : null,
    reportPackageCode: reportPackage.code,
  }));

  await localExporter.generatePDF({
    reportPackage,
    adminInfo: {
      company: report.organizationName || "Organization Name",
      site: report.siteLocation || "Field Inspection",
      inspector: report.leadInspector || "Inspector",
      date: formatReviewDate(report.inspectionDate || report.createdAt),
      isConfidential: Boolean(report.isConfidential),
      confidentialityMarkerText:
        report.confidentialityMarkerText || "Privileged & Confidential",
      companyLogo:
        report.includeLogoOnCover === false ? "" : report.companyLogo || "",
      reportPackageMode: report.reportPackageMode || "local_first",
      reportId: report.id || "",
      findingCount: report.findings?.length || findings.length,
      additionalInspectors: report.additionalInspectors || [],
    },
    findings,
  });
}
