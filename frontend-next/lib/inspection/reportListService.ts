import { Report } from "./inspectionTypes";

export function getReportStableKey(report: Report) {
  return String(report.cloudReportId || report.id || "");
}

export function mergeReports(localReports: Report[], cloudReports: Report[]) {
  const byKey = new Map<string, Report>();

  for (const report of localReports) {
    const key = getReportStableKey(report);
    if (!key) continue;
    byKey.set(key, {
      ...report,
      storageSource: report.storageSource || "local",
    });
  }

  for (const report of cloudReports) {
    const key = getReportStableKey(report);
    if (!key) continue;

    const existing = byKey.get(key);

    byKey.set(key, {
      ...(existing || {}),
      ...report,
      storageSource: "cloud",
      cloudReportId: report.cloudReportId || existing?.cloudReportId,
      cloudSavedAt: report.cloudSavedAt || existing?.cloudSavedAt,
    });
  }

  return Array.from(byKey.values());
}

export function getRiskLabel(report: Report) {
  const scores =
    report.findings?.map((finding: any) => {
      const matrixScore =
        finding.riskScore ??
        finding.safeScopeResult?.risk?.riskScore ??
        finding.safeScopeResult?.risk?.operationalRisk?.matrixScore;

      const score = Number(matrixScore);
      return Number.isFinite(score) ? score : null;
    }) || [];

  const bands =
    report.findings?.map((finding: any) =>
      String(
        finding.safeScopeResult?.risk?.riskBand ||
          finding.safeScopeResult?.risk?.operationalRisk?.matrixBand ||
          "",
      ).toLowerCase(),
    ) || [];

  const numericScores = scores.filter((score): score is number => score !== null);
  const max = Math.max(0, ...numericScores);

  if (bands.some((band) => band.includes("critical")) || max >= 20) {
    return "Critical";
  }

  if (bands.some((band) => band.includes("high")) || max >= 12) {
    return "High";
  }

  if (
    bands.some((band) => band.includes("medium") || band.includes("moderate")) ||
    max >= 6
  ) {
    return "Moderate";
  }

  if (numericScores.some((score) => score > 0)) return "Low";

  return "Unrated";
}

export function riskClasses(risk: string) {
  switch (risk) {
    case "Critical":
      return "bg-red-100 text-red-700";
    case "High":
      return "bg-orange-100 text-orange-700";
    case "Moderate":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-emerald-50 text-emerald-700";
  }
}

export function getStorageLabel(source?: Report["storageSource"]) {
  if (source === "cloud") return "Cloud Sync";
  if (source === "seed") return "Sample Record";
  return "Local Vault";
}

export function getStorageClass(source?: Report["storageSource"]) {
  if (source === "cloud") return "bg-blue-50 text-blue-700 border-blue-100";
  if (source === "seed") return "bg-slate-100 text-slate-600 border-slate-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-100";
}

export function getFieldOutputActions(finding: any): any[] {
  const actions = finding?.safeScopeResult?.fieldOutput?.correctiveActions;
  if (!Array.isArray(actions) || !actions.length) return [];

  return actions.map((action: any, index: number) => {
    if (typeof action === "string") {
      return {
        title: action,
        description: action,
        priority: finding?.safeScopeResult?.fieldOutput?.priority || "Medium",
        closureEvidence:
          finding?.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] ||
          "Supervisor verification",
        source: "HazLenz AI field output",
      };
    }

    return {
      ...action,
      title: action.title || action.description || `Field output action ${index + 1}`,
      priority:
        action.priority ||
        finding?.safeScopeResult?.fieldOutput?.priority ||
        "Medium",
      closureEvidence:
        action.closureEvidence ||
        action.verification ||
        finding?.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] ||
        "Supervisor verification",
      source: action.source || "HazLenz AI field output",
    };
  });
}

export function getFindingActionsForReports(finding: any): any[] {
  const fieldOutputActions = getFieldOutputActions(finding);
  if (fieldOutputActions.length) {
    return [
      ...fieldOutputActions,
      ...(Array.isArray(finding.manualActions) ? finding.manualActions : []),
    ];
  }

  return (
    finding.correctiveActions || [
      ...(finding.selectedGeneratedActions || []),
      ...(finding.manualActions || []),
      ...(finding.safeScopeResult?.generatedActions || []),
    ]
  );
}

export function getReportIntegrity(report: Report) {
  const findings = report.findings || [];
  const evidenceCount = findings.flatMap(
    (finding: any) => finding.photos || [],
  ).length;

  const safeScopeCount = findings.filter(
    (finding: any) => finding.safeScopeResult,
  ).length;

  const actionCount = findings.flatMap(
    (finding: any) =>
      getFindingActionsForReports(finding),
  ).length;

  const standardsCount = findings.flatMap(
    (finding: any) =>
      finding.selectedStandards ||
      finding.standards ||
      finding.safeScopeResult?.suggestedStandards ||
      finding.safeScopeResult?.needsMoreEvidenceStandards ||
      finding.safeScopeResult?.standardApplicability?.needsMoreEvidenceStandards ||
      [],
  ).length;

  return {
    evidenceCount,
    safeScopeCount,
    actionCount,
    standardsCount,
    hasEvidence: evidenceCount > 0,
    hasSafeScope: safeScopeCount > 0,
    hasActions: actionCount > 0,
  };
}

export function getReportTitle(report: Report) {
  return report.title || "Inspection Report";
}

export function getReportLocation(report: Report) {
  return (
    report.location ||
    report.siteLocation ||
    report.findings?.[0]?.location ||
    "Field Inspection"
  );
}

export function formatDate(value?: string) {
  if (!value) return "Not dated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not dated";
  return date.toLocaleDateString();
}

export function getReportDate(report: Report) {
  return formatDate(report.inspectionDate || report.createdAt);
}
