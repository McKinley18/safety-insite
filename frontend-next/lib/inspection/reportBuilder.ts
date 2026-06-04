import { generateInspectionReportId } from "./findingBuilder";

export function buildInspectionReport(input: {
  coverPage: any;
  findings: any[];
  includeStandardsInReport: boolean;
  includeActionsInReport: boolean;
  includePhotosInReport: boolean;
  includeSafeScopeNotesInReport: boolean;
  reportPackageMode?: string;
}) {
  const coverPage = input.coverPage || {};

  return {
    id: generateInspectionReportId(),
    createdAt: new Date().toISOString(),
    title: coverPage.organizationName
      ? `${coverPage.organizationName} Inspection Report`
      : "Inspection Report",
    organizationName: coverPage.organizationName || "",
    siteLocation: coverPage.siteLocation || "",
    inspectionDate: coverPage.inspectionDate || "",
    leadInspector: coverPage.leadInspector || "",
    additionalInspectors: coverPage.additionalInspectors || [],
    includeCoverPage: coverPage.includeCoverPage ?? true,
    isConfidential: !!coverPage.isConfidential,
    confidentialityMarkerText:
      coverPage.confidentialityMarkerText || "Privileged & Confidential",
    companyLogo: coverPage.companyLogo || "",
    includeLogoOnCover: coverPage.includeLogoOnCover ?? true,
    includeStandardsInReport: input.includeStandardsInReport,
    includeActionsInReport: input.includeActionsInReport,
    includePhotosInReport: input.includePhotosInReport,
    includeSafeScopeNotesInReport: input.includeSafeScopeNotesInReport,
    reportPackageMode: input.reportPackageMode || "professional_compliance",
    findings: input.findings,
  };
}
