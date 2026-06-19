import { normalizePdfPercent } from "./pdfFormattingHelpers";

export function getFindingStandardsForPdf(f: any) {
  return (
    (Array.isArray(f.selectedStandards) && f.selectedStandards.length
      ? f.selectedStandards
      : null) ||
    (Array.isArray(f.standards) && f.standards.length ? f.standards : null) ||
    (Array.isArray(f.safeScopeResult?.suggestedStandards) &&
    f.safeScopeResult.suggestedStandards.length
      ? f.safeScopeResult.suggestedStandards
      : [])
  );
}

export function getFieldOutputActionsForPdf(f: any) {
  const actions = f.safeScopeResult?.fieldOutput?.correctiveActions;
  if (!Array.isArray(actions) || !actions.length) return [];

  return actions.map((action: any, index: number) => {
    if (typeof action === "string") {
      return {
        title: action,
        description: action,
        priority: f.safeScopeResult?.fieldOutput?.priority || "Medium",
        closureEvidence:
          f.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] ||
          "Supervisor verification",
        source: "HazLenz AI field output",
      };
    }

    return {
      ...action,
      title: action.title || action.description || `Field output action ${index + 1}`,
      priority:
        action.priority ||
        f.safeScopeResult?.fieldOutput?.priority ||
        "Medium",
      closureEvidence:
        action.closureEvidence ||
        action.verification ||
        f.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] ||
        "Supervisor verification",
      source: action.source || "HazLenz AI field output",
    };
  });
}

export function getFindingActionsForPdf(f: any) {
  const fieldOutputActions = getFieldOutputActionsForPdf(f);
  if (fieldOutputActions.length) {
    return [
      ...fieldOutputActions,
      ...(Array.isArray(f.manualActions) ? f.manualActions : []),
    ];
  }

  return (
    (Array.isArray(f.correctiveActions) && f.correctiveActions.length
      ? f.correctiveActions
      : null) ||
    [
      ...(Array.isArray(f.selectedGeneratedActions)
        ? f.selectedGeneratedActions
        : []),
      ...(Array.isArray(f.manualActions) ? f.manualActions : []),
      ...(Array.isArray(f.safeScopeResult?.generatedActions)
        ? f.safeScopeResult.generatedActions
        : []),
    ]
  );
}

export function getFindingRiskForPdf(f: any) {
  return (
    f.safeScopeResult?.risk?.riskBand ||
    f.safeScopeResult?.risk?.operationalRisk?.matrixBand ||
    f.riskBand ||
    f.riskScore ||
    "Not rated"
  );
}

export function getFindingConfidenceForPdf(f: any) {
  return normalizePdfPercent(
    f.safeScopeResult?.confidenceIntelligence?.overallConfidence ??
      f.safeScopeResult?.confidence,
  );
}

export function getFindingCategoryForPdf(f: any) {
  return (
    f.category ||
    f.hazardCategory ||
    f.safeScopeResult?.classification ||
    "Uncategorized"
  );
}

export function getSafeScopeValidationStatusForPdf(f: any) {
  return (
    f.safeScopeValidationStatus ||
    f.safeScopeResult?.validationStatus ||
    f.safeScopeResult?.snapshotSummary?.validationStatus ||
    (f.safeScopeResult?.reasoningSnapshotId ? "generated" : f.safeScopeResult ? "local_unvalidated" : "manual")
  );
}
