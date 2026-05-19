import { generateInspectionReportId } from "./findingBuilder";

export function buildInspectionReport(input: {
  coverPage: any;
  findings: any[];
  includeStandardsInReport: boolean;
  includeActionsInReport: boolean;
  includePhotosInReport: boolean;
  includeSafeScopeNotesInReport: boolean;
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
    isConfidential: !!coverPage.isConfidential,
    includeStandardsInReport: input.includeStandardsInReport,
    includeActionsInReport: input.includeActionsInReport,
    includePhotosInReport: input.includePhotosInReport,
    includeSafeScopeNotesInReport: input.includeSafeScopeNotesInReport,
    findings: input.findings,
  };
}
