import { formatStandardDisplay } from "@/lib/inspection/standardDisplay";
import { getHazLenzMechanismChain } from "@/lib/inspection/mechanismReasoning";

export function getReportPersistenceKey(report: any) {
  return String(report?.cloudReportId || report?.id || "");
}

export function isSamePersistentReport(a: any, b: any) {
  const aKey = getReportPersistenceKey(a);
  const bKey = getReportPersistenceKey(b);

  if (!aKey || !bKey) return false;

  return aKey === bKey;
}

export function getFindingRisk(finding: any) {
  if (finding.safeScopeResult?.risk?.riskBand) {
    return finding.safeScopeResult.risk.riskBand;
  }

  if (finding.safeScopeResult?.risk?.operationalRisk?.matrixBand) {
    return finding.safeScopeResult.risk.operationalRisk.matrixBand;
  }

  if (finding.riskScore) return String(finding.riskScore);

  if (finding.severity && finding.likelihood) {
    return String(finding.severity * finding.likelihood);
  }

  return "Not rated";
}

export function getRiskTone(value: string) {
  const risk = String(value || "").toLowerCase();

  if (risk.includes("critical")) return "bg-red-100 text-red-700";
  if (risk.includes("high")) return "bg-orange-100 text-orange-700";
  if (risk.includes("medium") || risk.includes("moderate")) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-100 text-slate-700 dark:text-slate-300";
}

export function getFindingTitle(finding: any) {
  return (
    finding.hazardCategory ||
    finding.safeScopeResult?.classification ||
    finding.category ||
    "Uncategorized finding"
  );
}

export function getActionTitle(action: any) {
  return (
    action?.title ||
    action?.description ||
    action?.suggestedFixes?.[0] ||
    "Corrective action"
  );
}

export function getStandardCitation(standard: any) {
  return formatStandardDisplay(standard);
}

export function getReportPackageLabel(mode?: string) {
  if (mode === "field_summary") return "Field Summary";
  if (mode === "professional_compliance") return "Professional Compliance";
  if (mode === "validation_appendix") return "Full Validation Appendix";
  if (mode === "evidence_centered") return "Evidence-centered package";
  if (mode === "export_ready") return "Export-ready package";
  if (mode === "ask_every_report") return "Ask every report";
  return "Local-first private vault";
}


export function formatReviewConfidence(value: any) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const percent = numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
  return `${percent}%`;
}

export function formatReviewDate(value?: string) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export function getSafeScopeValidationStatus(finding: any) {
  const status =
    finding?.safeScopeResult?.validationStatus ||
    finding?.safeScopeResult?.snapshotSummary?.validationStatus ||
    finding?.safeScopeResult?.reasoningSnapshotSummary?.validationStatus ||
    "";

  if (status) return String(status);

  if (finding?.safeScopeResult?.reasoningSnapshotId) return "generated";
  if (finding?.safeScopeResult) return "local_unvalidated";
  return "manual";
}

export function formatSafeScopeValidationStatus(status: any) {
  const value = String(status || "manual");

  const labels: Record<string, string> = {
    manual: "Manual finding",
    local_unvalidated: "HazLenz AI local review needed",
    generated: "HazLenz AI generated — review needed",
    requires_review: "HazLenz AI review required",
    validated_accepted: "HazLenz AI accepted by reviewer",
    validated_modified: "HazLenz AI modified by reviewer",
    validated_rejected: "HazLenz AI rejected by reviewer",
    requires_escalation: "HazLenz AI escalated",
    requires_more_evidence: "More evidence required",
  };

  return labels[value] || value.replace(/_/g, " ");
}

export function isSafeScopeValidationComplete(status: any) {
  return ["validated_accepted", "validated_modified", "validated_rejected"].includes(
    String(status || ""),
  );
}

export function getSafeScopeReviewSummary(findings: any[]) {
  const safeScopeFindings = findings.filter((finding) => finding.safeScopeResult);
  const unvalidated = safeScopeFindings.filter(
    (finding) => !isSafeScopeValidationComplete(getSafeScopeValidationStatus(finding)),
  );
  const escalated = safeScopeFindings.filter((finding) =>
    ["requires_escalation", "requires_more_evidence", "requires_review"].includes(
      getSafeScopeValidationStatus(finding),
    ),
  );

  return {
    total: safeScopeFindings.length,
    unvalidated: unvalidated.length,
    escalated: escalated.length,
  };
}

export function asReviewList(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).map((item) => String(item));
}

export function getFieldOutputActions(finding: any): any[] {
  const actions = finding?.safeScopeResult?.fieldOutput?.correctiveActions;
  if (!Array.isArray(actions) || !actions.length) return [];

  return actions
    .filter(Boolean)
    .map((action: any, index: number) => {
      if (typeof action === "string") {
        return {
          title: action,
          description: action,
          priority: finding?.safeScopeResult?.fieldOutput?.priority || "Medium",
          suggestedFixes: [action],
          verification:
            finding?.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] ||
            "Supervisor verification required before closure.",
          closureEvidence:
            finding?.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] ||
            "Supervisor verification",
          owner: "",
          assignedTo: "",
          due: "",
          dueDate: "",
          source: "HazLenz AI field output",
        };
      }

      return {
        ...action,
        title:
          action.title ||
          action.description ||
          action.suggestedFixes?.[0] ||
          `HazLenz AI corrective action ${index + 1}`,
        description:
          action.description ||
          action.suggestedFixes?.[0] ||
          action.title ||
          "HazLenz AI field-output corrective action.",
        priority:
          action.priority ||
          finding?.safeScopeResult?.fieldOutput?.priority ||
          "Medium",
        closureEvidence:
          action.closureEvidence ||
          action.verification ||
          finding?.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] ||
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

export function getFindingActionsForReview(finding: any, includeActions = true): any[] {
  if (!includeActions) return [];

  if (Array.isArray(finding?.correctiveActions) && finding.correctiveActions.length) {
    return finding.correctiveActions;
  }

  const selectedOrManualActions = [
    ...(Array.isArray(finding?.selectedGeneratedActions) ? finding.selectedGeneratedActions : []),
    ...(Array.isArray(finding?.manualActions) ? finding.manualActions : []),
  ];

  if (selectedOrManualActions.length) {
    return selectedOrManualActions;
  }

  return getFieldOutputActions(finding);
}

export function getFieldOutputEvidenceGaps(finding: any): string[] {
  return asReviewList(finding?.safeScopeResult?.fieldOutput?.evidenceGaps);
}

export function getFieldOutputSupervisorQuestions(finding: any): string[] {
  return asReviewList(finding?.safeScopeResult?.fieldOutput?.supervisorQuestions);
}

export function getFieldOutputWarnings(finding: any): string[] {
  return asReviewList(finding?.safeScopeResult?.fieldOutput?.warnings);
}

export function formatEquipmentReasoningMode(value: any) {
  const mode = String(value || "insufficient_equipment_context");

  const labels: Record<string, string> = {
    specific_with_archetype_support: "Specific match + archetype support",
    specific_task_mechanism: "Specific equipment mechanism",
    archetype_fallback: "Archetype fallback",
    insufficient_equipment_context: "Insufficient equipment context",
  };

  return labels[mode] || mode.replace(/_/g, " ");
}

export function getFindingMechanismChain(finding: any) {
  return getHazLenzMechanismChain(finding?.safeScopeResult || finding);
}
