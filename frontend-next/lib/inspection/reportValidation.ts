export function validateInspectionReport(findings: any[]) {
  if (!findings.length) {
    return "Add at least one finding before generating the report.";
  }

  for (let index = 0; index < findings.length; index++) {
    const finding = findings[index];
    const label = `Finding ${index + 1}`;

    if (!finding.description?.trim()) {
      return `${label}: Add a hazard description.`;
    }
  }

  return "";
}
