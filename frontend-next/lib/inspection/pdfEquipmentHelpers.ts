import { formatEquipmentReasoningModeForPdf } from "./pdfFormattingHelpers";

export function asPdfList(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).map((item) => String(item));
}

export function buildEquipmentReasoningNotesForPdf(safeScopeResult: any): string[] {
  const summary = safeScopeResult?.equipmentReasoningSummary;
  const taskContext = safeScopeResult?.equipmentTaskMechanismContext;
  const archetypeContext = safeScopeResult?.equipmentArchetypeContext;

  if (!summary && !taskContext?.matched && !archetypeContext?.matched) {
    return [];
  }

  const primarySpecific = taskContext?.primaryMatch;
  const primaryArchetype = archetypeContext?.primaryMatch;

  const mechanisms = asPdfList(
    primarySpecific?.harmMechanisms || primaryArchetype?.harmMechanisms,
  )
    .slice(0, 4)
    .map((item) => item.replace(/_/g, " "));

  const domains = asPdfList(
    primarySpecific?.likelyHazardDomains || primaryArchetype?.likelyHazardDomains,
  )
    .slice(0, 4)
    .map((item) => item.replace(/_/g, " "));

  const notes = [
    `Equipment reasoning mode: ${formatEquipmentReasoningModeForPdf(summary?.primaryReasoningMode)}`,
    `Primary equipment context: ${summary?.primaryEquipmentContext || "Unknown"}`,
    `Primary mechanism/archetype: ${summary?.primaryMechanismOrArchetype || "Unknown"}`,
  ];

  if (summary?.supportingContext?.length) {
    notes.push(`Supporting equipment context: ${summary.supportingContext.slice(0, 2).join("; ")}`);
  }

  if (mechanisms.length) {
    notes.push(`Equipment harm mechanism(s): ${mechanisms.join("; ")}`);
  }

  if (domains.length) {
    notes.push(`Equipment-related domain(s): ${domains.join("; ")}`);
  }

  const rankingReasons = asPdfList(summary?.rankingReasons).slice(0, 2);
  if (rankingReasons.length) {
    notes.push(`Equipment ranking basis: ${rankingReasons.join("; ")}`);
  }

  const evidenceQuestions = asPdfList(summary?.evidenceGaps).slice(0, 3);
  if (evidenceQuestions.length) {
    notes.push(`Equipment evidence question(s): ${evidenceQuestions.join("; ")}`);
  }

  const cautions = asPdfList(summary?.cautions).slice(0, 2);
  if (cautions.length) {
    notes.push(`Equipment caution(s): ${cautions.join("; ")}`);
  }

  notes.push(
    "Equipment reasoning is context-only and requires qualified review; it does not declare violations, create citations, or override regulations.",
  );

  return notes;
}
