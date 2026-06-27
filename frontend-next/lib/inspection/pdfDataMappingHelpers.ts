import { normalizePdfPercent } from "./pdfFormattingHelpers";
import { getHazLenzMechanismChain } from "./mechanismReasoning";

export function getFindingStandardsForPdf(f: any) {
  if (Array.isArray(f.safeScopeResult?.standardDecisions) && f.safeScopeResult.standardDecisions.length) {
    return f.safeScopeResult.standardDecisions;
  }
  if (Array.isArray(f.selectedStandards) && f.selectedStandards.length) {
    return f.selectedStandards;
  }
  if (Array.isArray(f.standards) && f.standards.length) {
    return f.standards;
  }
  if (Array.isArray(f.safeScopeResult?.suggestedStandards) && f.safeScopeResult.suggestedStandards.length) {
    return f.safeScopeResult.suggestedStandards;
  }
  if (Array.isArray(f.safeScopeResult?.inspectionIntelligence?.candidateStandards) && f.safeScopeResult.inspectionIntelligence.candidateStandards.length) {
    return f.safeScopeResult.inspectionIntelligence.candidateStandards;
  }
  if (Array.isArray(f.safeScopeResult?.needsMoreEvidenceStandards) && f.safeScopeResult.needsMoreEvidenceStandards.length) {
    return f.safeScopeResult.needsMoreEvidenceStandards;
  }
  if (Array.isArray(f.safeScopeResult?.standardApplicability?.needsMoreEvidenceStandards) && f.safeScopeResult.standardApplicability.needsMoreEvidenceStandards.length) {
    return f.safeScopeResult.standardApplicability.needsMoreEvidenceStandards;
  }
  if (f.safeScopeResult?.executiveJudgment?.topStandard) {
    return [f.safeScopeResult.executiveJudgment.topStandard];
  }
  return [];
}

export function getFindingMechanismChainForPdf(f: any) {
  return getHazLenzMechanismChain(f?.safeScopeResult || f) || null;
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
        owner: "",
        assignedTo: "",
        assignedRole: "",
        due: "",
        dueDate: "",
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
      owner: "",
      assignedTo: "",
      assignedRole: "",
      due: "",
      dueDate: "",
      source: action.source || "HazLenz AI field output",
    };
  });
}

export function getFindingActionsForPdf(f: any) {
  if (Array.isArray(f.correctiveActions) && f.correctiveActions.length) {
    return f.correctiveActions;
  }

  const selectedOrManualActions = [
    ...(Array.isArray(f.selectedGeneratedActions) ? f.selectedGeneratedActions : []),
    ...(Array.isArray(f.manualActions) ? f.manualActions : []),
  ];

  if (selectedOrManualActions.length) {
    return selectedOrManualActions;
  }

  return getFieldOutputActionsForPdf(f);
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
