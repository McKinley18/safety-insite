import { getStandardDisplayText } from "./standardDisplay";

export function normalizePdfPercent(value: any) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
}

export function formatSafeScopeValidationStatusForPdf(status: any) {
  const value = String(status || "manual");
  const labels: Record<string, string> = {
    manual: "Manual finding",
    local_unvalidated: "HazLenz AI local review needed",
    generated: "HazLenz AI generated - review needed",
    requires_review: "HazLenz AI review required",
    validated_accepted: "HazLenz AI accepted by reviewer",
    validated_modified: "HazLenz AI modified by reviewer",
    validated_rejected: "HazLenz AI rejected by reviewer",
    requires_escalation: "HazLenz AI escalated",
    requires_more_evidence: "More evidence required",
  };
  return labels[value] || value.replace(/_/g, " ");
}

export function formatEquipmentReasoningModeForPdf(value: any) {
  const mode = String(value || "insufficient_equipment_context");

  const labels: Record<string, string> = {
    specific_with_archetype_support: "Specific match + archetype support",
    specific_task_mechanism: "Specific equipment mechanism",
    archetype_fallback: "Archetype fallback",
    insufficient_equipment_context: "Insufficient equipment context",
  };

  return labels[mode] || mode.replace(/_/g, " ");
}

export function getStandardCitationForPdf(standard: any) {
  return (
    standard?.citation ||
    standard?.standard ||
    standard?.label ||
    standard?.title ||
    String(standard)
  );
}

export function getStandardSummaryForPdf(standard: any) {
  const display = getStandardDisplayText(standard);
  return display.label === "Unavailable" ? "" : `${display.label}: ${display.text}`;
}

export function formatPdfDate(value?: string) {
  if (!value) return new Date().toLocaleDateString("en-US");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}
