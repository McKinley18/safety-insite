# Over-abstention root cause

The primary proven defect was response composition, not classification: NarrativeGeneratorService contained explicit placeholder strings and did not consume the already-computed mechanism, risk, evidence-gap, standards, or corrective-action objects. This made a partially supported response appear generic even when structured fields contained actionable reasoning.

A secondary limitation is standards applicability coverage: 17/60 observations lacked a specific candidate, which is not by itself an engine defect where jurisdiction/predicate evidence is missing. Clarification-heavy rows must be reviewed by a qualified safety professional; the audit does not justify converting uncertainty to active findings.

## Categories

- **RESPONSE_COMPOSITION_FAILURE (60)** — Before the fix, NarrativeGeneratorService returned literal placeholder strings for corrective, interim, permanent, administrative, and verification fields even when mechanismChain/generatedActions were populated. Resolution: Enrich narrative from existing evidence-bound scenario, risk, standards, evidence-gap, and corrective-action outputs.
- **STANDARD_APPLICABILITY_GAP (17)** — 17/60 audit responses had no specific standard candidate in the returned projection. Resolution: Inventory and expand structured applicability predicates only after qualified review; do not infer citations from vocabulary alone.
- **CLARIFICATION_OVERREACH (10)** — Ten outputs had absent or generic clarification quality under the heuristic; supported hazard reasoning was still present in structured fields. Resolution: Review question generation and preserve partial answers; do not suppress supported mechanism/control content.
- **KNOWLEDGE_COVERAGE_GAP (0)** — No broad mechanism failure was observed in this sample; domain coverage remains unvalidated for several families. Resolution: Build versioned structured hazard/control knowledge with provenance.
