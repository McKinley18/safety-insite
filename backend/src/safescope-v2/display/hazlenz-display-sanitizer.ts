const DISPLAY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bSafeScope Intelligence Orchestrator\b/g, "HazLenz AI Orchestrator"],
  [/\bSafeScope advisory output\b/g, "HazLenz AI advisory output"],
  [/\bSafeScope multi-hazard decomposition is advisory only\b/g, "HazLenz AI multi-hazard decomposition is advisory only"],
  [/\bSafeScope causal chain reasoning is advisory only\b/g, "HazLenz AI causal chain reasoning is advisory only"],
  [/\bSafeScope corrective action strategies are advisory only\b/g, "HazLenz AI corrective action strategies are advisory only"],
  [/\bSafeScope risk verification and residual risk reassessment is advisory only\b/g, "HazLenz AI risk verification and residual risk reassessment is advisory only"],
  [/\bSafeScope jurisdiction assessment is advisory and requires qualified legal\/safety review\./g, "HazLenz AI jurisdiction assessment is advisory and requires qualified legal/safety review."],
  [/\bSafeScope semantic expansion is advisory only and utilizes NLP stemming and deterministic mapping\./g, "HazLenz AI semantic expansion is advisory only and utilizes NLP stemming and deterministic mapping."],
  [/\bSafeScope visual evidence reasoning is based on attachment metadata and notes only\. It is not an automated image recognition result\./g, "HazLenz AI visual evidence reasoning is based on attachment metadata and notes only. It is not an automated image recognition result."],
  [/\bSafeScope NLP Dynamic Evidence Generator\b/g, "HazLenz AI Dynamic Evidence Generator"],
  [/\bSafeScope reconstructed\b/g, "HazLenz AI reconstructed"],
  [/\bSafeScope confidence\b/g, "HazLenz AI confidence"],
  [/\bSafeScope mappings\b/g, "HazLenz AI mappings"],
  [/\bSafeScope recommendation\b/g, "HazLenz AI recommendation"],
  [/\bSafeScope engine\b/g, "HazLenz AI engine"],
  [/\bSafeScope\b/g, "HazLenz AI"],

  // The retired product names, taken from the list that
  // src/safescope-v2/tests/smoke/hazlenz-field-output-smoke.js already asserts must
  // never appear in HazLenz field output. Only "SafeScope" had a rule, so a residual
  // legacy string elsewhere in the engine still reached the customer -- the offline
  // advisory returned "Sync observation with Sentinel backend" verbatim. This is the
  // designated single point where display naming is corrected, so the remaining five
  // names in that contract are handled here rather than hunted string by string.
  //
  // "Sentinel Safety" must precede the bare "Sentinel" rule, or the longer name would
  // be rewritten to "Safety InSite Safety". These patterns are case-sensitive by
  // design: they must not touch lowercase internal identifiers such as the
  // `sentinel_*` storage keys or the `safescope-v2` API namespace.
  [/\bSentinel Safety\b/g, "Safety InSite"],
  [/\bSentinel\b/g, "Safety InSite"],
  [/\bReviewCore\b/g, "HazLenz AI"],
  [/\bGuideGuard\b/g, "Safety InSite"],
  [/\bSightSignal\b/g, "Safety InSite"],
  [/\bAuditAlly\b/g, "Safety InSite"],
];

const DISPLAY_ENGINE_REPLACEMENTS: Record<string, string> = {
  safescope_understanding_engine: "hazlenz_understanding_engine",
  safescope_causal_risk_reasoning: "hazlenz_causal_risk_reasoning",
  safescope_evidence_sufficiency_engine: "hazlenz_evidence_sufficiency_engine",
  safescope_output_policy_governor: "hazlenz_output_policy_governor",
  safescope_defensible_corrective_action_core: "hazlenz_defensible_corrective_action_core",
  safescope_human_review_learning_governance_core: "hazlenz_human_review_learning_governance_core",
  safescope_source_backed_applicability_governance_core: "hazlenz_source_backed_applicability_governance_core",
  safescope_approved_source_knowledge_intake_governance_core: "hazlenz_approved_source_knowledge_intake_governance_core",
  safescope_approved_knowledge_registry_write_guard_core: "hazlenz_approved_knowledge_registry_write_guard_core",
  safescope_confidence_governance_core: "hazlenz_confidence_governance_core",
  safescope_learning_memory: "hazlenz_learning_memory",
  safescope_contradiction_intelligence_v1: "hazlenz_contradiction_intelligence_v1",
  safescope_native: "hazlenz_native",
  safescope_mechanism_intelligence: "hazlenz_mechanism_intelligence",
  safescope_governed_brain: "hazlenz_governed_brain",
  safescope_v2_enriched_corrective_action: "hazlenz_v2_enriched_corrective_action",
  safescope_v2_dca_corrective_action_brain: "hazlenz_v2_dca_corrective_action_brain",
};

function sanitizeString(value: string): string {
  if (DISPLAY_ENGINE_REPLACEMENTS[value]) {
    return DISPLAY_ENGINE_REPLACEMENTS[value];
  }

  let sanitized = value;

  for (const [pattern, replacement] of DISPLAY_REPLACEMENTS) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  return sanitized;
}

const HIDDEN_STANDARD_OUTPUT_FIELDS = new Set([
  // Reviewer-console/dev payloads should not be included in normal field inspection responses.
  "pendingReviewerCandidates",
  "draftKnowledgeWarnings",

  // Heavy duplicate/debug reasoning blocks. Keep the concise report-facing fields instead.
  "retrieval",
  "knowledgeBrain",
  "inspectionIntelligence",
  "decisionSupportMetadata",
  "baseGeneratedActions",
  "generatedActionsEnrichment",
  "composer",
  "askig",
  "akpwg",
  "akrwg",
  "hrlg",
  "sbag",
  "sourceAwareAnalysis",
  "nativeReasoning",
  "observationUnderstanding",
  "dca",
  "evidenceGate",
  "evidenceSufficiency",
  "confidenceGovernance",

  // Display-size controls:
  // These fields duplicate concise report/API fields or contain internal ranking metadata.
  // Keep report-facing fields such as standardsTraceability, standardsReasoning,
  // generatedActions, mechanismChain, risk, and correctiveActionReasoning.
  "applicabilityIntelligence",
  "supplementalGuidance",
  "outputPolicy",
  "operationalReasoning",
  "primaryStandards",
  "suggestedStandards",
  "standards",
]);

export function sanitizeHazLenzDisplayOutput<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return sanitizeString(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeHazLenzDisplayOutput(item)) as T;
  }

  if (typeof value === "object") {
    const output: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      if (HIDDEN_STANDARD_OUTPUT_FIELDS.has(key)) {
        continue;
      }

      output[key] = sanitizeHazLenzDisplayOutput(nestedValue);
    }

    return output as T;
  }

  return value;
}
