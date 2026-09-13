# SafeScope Canonical Pipeline Map

Generated: 2026-06-03T13:42:37.365979+00:00

## Purpose

This document maps the active SafeScope reasoning path from field observation to final report output. It is intended to prevent disconnected logic, duplicate intelligence, and hidden regressions as SafeScope becomes more capable.

## Pipeline

### 1. Field Input Capture

**Purpose:** Capture observation text, evidence notes, photos, regulatory scope, risk profile, and workspace context.

**Primary files:**

- `frontend-next/app/inspection/page.tsx`
- `frontend-next/components/inspection/SafeScopeControlsSection.tsx`
- `frontend-next/lib/safescope.ts`
- `backend/src/safescope-v2/dto/classify.dto.ts`
- `backend/src/safescope-v2/safescope-v2.controller.ts`

**Output:** ClassifyDto / SafeScope classify request

### 2. Evidence Fusion

**Purpose:** Combine hazard description and supporting evidence text into one usable narrative for classification and reasoning.

**Primary files:**

- `backend/src/safescope-v2/evidence/evidence-fusion.service.ts`
- `backend/src/safescope-v2/safescope-v2.service.ts`

**Output:** fusedText / combinedNarrative

### 3. Hazard Classification

**Purpose:** Identify primary hazard classification, confidence, additional hazards, excluded hazards, and review requirement.

**Primary files:**

- `backend/src/safescope-v2/classifier/weighted-classifier.service.ts`
- `backend/src/safescope-v2/engine/deterministic-classifier.ts`
- `backend/src/safescope-v2/taxonomy/safescope-taxonomy.registry.ts`
- `backend/src/safescope-v2/brain/hazard-universe/hazard-universe.registry.ts`
- `backend/src/safescope-v2/safescope-v2.service.ts`

**Output:** classification candidate(s)

### 4. Mechanism / Exposure / Operational Context

**Purpose:** Determine mechanisms of injury, energy transfer, exposure path, equipment context, operational state, event sequence, and related controls.

**Primary files:**

- `backend/src/safescope-v2/mechanism-intelligence/mechanism-intelligence.service.ts`
- `backend/src/safescope-v2/equipment-knowledge/equipment-task-mechanism-detector.service.ts`
- `backend/src/safescope-v2/equipment-knowledge/equipment-archetype-detector.service.ts`
- `backend/src/safescope-v2/energy-intelligence/energy-transfer-intelligence.service.ts`
- `backend/src/safescope-v2/exposure-intelligence/exposure-intelligence.service.ts`
- `backend/src/safescope-v2/exposure-path/exposure-path.service.ts`
- `backend/src/safescope-v2/operational-state/operational-state.service.ts`
- `backend/src/safescope-v2/event-sequence/event-sequence.service.ts`

**Output:** mechanism, exposure, equipment, and operational reasoning

### 5. Brain Query and Snapshot

**Purpose:** Query regulatory, mechanism, controls, and evidence brain compartments and assemble a situational awareness packet.

**Primary files:**

- `backend/src/safescope-v2/brain/query-orchestrator/brain-query-orchestrator.service.ts`
- `backend/src/safescope-v2/brain/snapshot-builder/brain-snapshot-builder.service.ts`
- `backend/src/safescope-v2/brain/regulatory-brain/regulatory-brain.service.ts`
- `backend/src/safescope-v2/brain/mechanism-brain/mechanism-brain.service.ts`
- `backend/src/safescope-v2/brain/controls-brain/controls-brain.service.ts`
- `backend/src/safescope-v2/brain/evidence-brain/evidence-brain.service.ts`

**Output:** brainSnapshot / situationalAwarenessPacket

### 6. Standards Matching and Applicability

**Purpose:** Rank standards by scope fit, applicability, source authority, and hazard context while preserving human-review boundaries.

**Primary files:**

- `backend/src/applicable-standards/applicable-standards.service.ts`
- `backend/src/safescope-v2/standards-intelligence/standards-intelligence.service.ts`
- `backend/src/safescope-v2/standards-reasoning/standards-reasoning.service.ts`
- `backend/src/safescope-v2/regulatory-applicability/regulatory-applicability.service.ts`
- `backend/src/safescope-v2/reasoning-orchestrator/applicability/applicability-analysis.service.ts`
- `backend/src/safescope-v2/brain/regulatory-brain/regulatory-knowledge.registry.ts`

**Output:** suggestedStandards / topStandards / applicability reasoning

### 7. Evidence Gaps and Decision Confidence

**Purpose:** Identify missing critical information, unsupported claims, review triggers, confidence limits, and whether qualified review is required.

**Primary files:**

- `backend/src/safescope-v2/brain/evidence-gap-intelligence/evidence-gap-intelligence.service.ts`
- `backend/src/safescope-v2/evidence-quality/evidence-quality.service.ts`
- `backend/src/safescope-v2/evidence-sufficiency/evidence-sufficiency.service.ts`
- `backend/src/safescope-v2/confidence/confidence-intelligence.service.ts`
- `backend/src/safescope-v2/brain/decision-confidence/decision-confidence.service.ts`
- `backend/src/safescope-v2/validation/confidence-calibration.service.ts`
- `backend/src/safescope-v2/validation/reasoning-drift.service.ts`

**Output:** evidence gaps, confidence intelligence, review triggers

### 8. Corrective Action Intelligence

**Purpose:** Generate corrective controls, immediate controls, action quality signals, control effectiveness reasoning, and verification evidence.

**Primary files:**

- `backend/src/action-engine/action-engine.service.ts`
- `backend/src/safescope-v2/corrective-actions/corrective-action-template.registry.ts`
- `backend/src/safescope-v2/action-quality/action-quality.service.ts`
- `backend/src/safescope-v2/action-effectiveness/action-effectiveness.service.ts`
- `backend/src/safescope-v2/control-effectiveness/control-effectiveness.service.ts`
- `backend/src/safescope-v2/control-intelligence/control-intelligence.service.ts`
- `backend/src/safescope-v2/brain/controls-brain/controls-knowledge.registry.ts`

**Output:** generatedActions / correctiveActions / immediateControls

### 9. Field Output Contract

**Purpose:** Package SafeScope output into a field-usable contract with primary message, priority, disposition, controls, actions, evidence gaps, questions, warnings, and review boundary.

**Primary files:**

- `backend/src/safescope-v2/safescope-v2.service.ts`
- `backend/scripts/validate-safescope-field-output-contract.ts`
- `backend/scripts/validate-safescope-field-output-scenarios.ts`
- `backend/scripts/validate-safescope-field-realism-gauntlet.ts`

**Output:** fieldOutput v1

### 10. Finding Persistence

**Purpose:** Preserve SafeScope output, selected standards, selected actions, field-output actions, manual actions, risk, and evidence into a report finding.

**Primary files:**

- `frontend-next/lib/inspection/findingBuilder.ts`
- `frontend-next/app/inspection/page.tsx`
- `frontend-next/lib/inspection/reportBuilder.ts`
- `frontend-next/lib/reportStorage.ts`

**Output:** saved finding / inspection report

### 11. Review, Export, and Traceability

**Purpose:** Show findings, SafeScope appendix, validation status, field-output evidence gaps, supervisor questions, and export PDF report package.

**Primary files:**

- `frontend-next/app/inspection-review/page.tsx`
- `frontend-next/app/reports/page.tsx`
- `frontend-next/lib/localExporter.ts`
- `frontend-next/lib/reportPackages.ts`

**Output:** reviewed report / PDF export

### 12. Human Feedback and Governed Learning

**Purpose:** Capture qualified reviewer feedback, supervisor validation, learning memory, and improvement candidates without allowing automatic self-modification.

**Primary files:**

- `backend/src/safescope-v2/feedback/safescope-feedback.service.ts`
- `backend/src/safescope-v2/validation/supervisor-validation.service.ts`
- `backend/src/safescope-v2/brain/learning-memory/learning-memory.service.ts`
- `backend/src/safescope-v2/brain/improvement-candidate-engine/improvement-candidate-engine.service.ts`
- `backend/src/safescope-v2/learning/learning-governance.service.ts`

**Output:** review signals / learning memory / improvement candidates

## Open Questions

- Are all older intelligence modules still used in the active classify path, or do some need to be retired or explicitly marked legacy?
- Should every SafeScope output include a brainSnapshot summary and a fieldOutput contract by default?
- Should fieldOutput become the primary object used by the frontend for actions/evidence gaps instead of generatedActions?
- Do all standards suggestions include scope fit, source authority, and applicability rationale in a consistent shape?
- Do corrective actions always include verification evidence and action effectiveness reasoning?
- Do supervisor validation and feedback produce measurable learning-memory records that feed improvement candidates?

## Recommended Next Tasks

- Add an automated pipeline contract validator that asserts every major stage returns a stable object.
- Add a dependency map that marks each SafeScope service as active, supporting, experimental, legacy, or unused.
- Add a duplicate/overlap audit for standards, controls, evidence, mechanism, and scenario registries.
- Add adversarial gauntlets for conflicting evidence, vague observations, multi-hazard observations, and misleading keywords.
- Add governed learning workflow tests from supervisor feedback to learning memory to improvement candidates.
