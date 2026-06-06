# Sentinel Safety Capability Index

This is the working table of contents for Sentinel Safety and SafeScope.

Purpose:

- Track verified capabilities already integrated.
- Identify where each capability lives in the codebase.
- Record validation proof, benchmark results, and known gaps.
- Give future development sessions a fast reference point before making edits.

Last updated: 2026-06-06

---

## 1. Product Overview

Sentinel Safety is a safety inspection, reporting, corrective-action, and intelligence platform.

SafeScope is the internal safety intelligence engine used by Sentinel Safety to evaluate hazard observations, identify mechanisms of injury, suggest applicable standards, reason about risk, and recommend corrective actions.

Current operating boundary:

- Advisory-only safety intelligence.
- Does not declare regulatory violations.
- Does not create citations.
- Requires qualified human review before final reliance.

Primary app folders:

- frontend-next/
- backend/
- project-docs/
- safescope-data/

---


---

## Latest Validation Checkpoint: SafeScope Precision Scenario Understanding

Date verified: 2026-06-06

Commit:

- 36a4254 Expand SafeScope precision scenario understanding

Validation results:

- Backend TypeScript build passed.
- SafeScope precision batch 001 passed.
- SafeScope precision batch 002 passed.
- SafeScope precision batch 003 passed.
- Observation understanding validation passed.
- SafeScope understanding engine validation passed.
- Main output observation-understanding validation passed.
- Observation trace snapshot validation passed.
- Field output contract validation passed.

Precision benchmark status:

- Batch 001: 10/10 exact matches across hazard family, scenario family, mechanism, risk band, and standard family.
- Batch 002: 10/10 exact matches across hazard family, scenario family, mechanism, risk band, and standard family.
- Batch 003: 10/10 exact matches across hazard family, scenario family, mechanism, risk band, and standard family.

Capabilities expanded in this checkpoint:

- Fall-to-lower-level recognition for roof edges, ladders, floor holes, uncovered openings, and lower-level exposure.
- Lockout/tagout override when servicing or maintenance includes missing energy isolation or unexpected startup exposure.
- Hazard Communication recognition for unlabeled chemical containers, missing SDS, and missing hazard labels.
- Permit-required confined space recognition for tanks, limited ventilation, entry, missing atmospheric testing, missing attendant, missing permit, and missing rescue plan.
- Suspended-load and crane/rigging line-of-fire recognition.
- Pressurized hose / compressed air stored-energy recognition.
- Scenario-specific standard-family calibration for the above domains.
- Scenario-specific risk-band calibration for critical and high consequence scenarios.

Defensibility note:

SafeScope remains advisory-only. These validations prove deterministic scenario-understanding behavior against curated benchmark cases. They do not convert SafeScope into an autonomous regulatory decision maker, violation engine, or citation authority.

Known next maturity step:

Move from green curated precision batches into broader defensibility testing, including larger mixed-domain benchmarks, false-positive/false-negative gauntlets, source-backed regulatory mapping, evidence sufficiency scoring, reviewer feedback loops, and field validation tracking.


## 2. Current Verified Build Status

Backend:

- Location: backend/
- Validation command: cd backend && npm run build
- Latest result: TypeScript backend build passed.

Frontend:

- Location: frontend-next/
- Validation command: cd frontend-next && npm run build
- Latest result: Next.js production build passed.
- Latest known generated pages: 27/27 static pages.

Status:

- Backend build verified.
- Frontend build verified.
- SafeScope precision batches 001, 002, and 003 verified green.

---

## 3. Frontend Application

Active source:

- frontend-next/

Primary routes:

- /
- /about
- /actions
- /analytics
- /command-center
- /company
- /forgot-password
- /inspection
- /inspection-cover
- /inspection-quick
- /inspection-review
- /inspection-walkthrough
- /inspections
- /legal
- /login
- /profile
- /register
- /reports
- /safescope
- /safescope-knowledge
- /safety-calendar
- /settings
- /settings/workspace
- /unlock

Known integrated frontend areas:

- Command Center dashboard.
- Inspections list.
- Inspection workflow.
- Quick inspection.
- Inspection review.
- Reports.
- Actions.
- Analytics.
- Company hub.
- Settings.
- Workspace settings.
- Profile.
- Login/register/forgot password.
- About/legal/SafeScope information pages.

Status:

- Integrated.
- Build verified.

Open improvement areas:

- Continue UI consistency polish.
- Confirm mobile responsiveness page by page.
- Confirm final auth behavior before release.
- Confirm Company plan gating in real account flow.
- Confirm final branding and slogan state.

---

## 4. Inspection Workflow

Primary locations:

- frontend-next/app/inspection/
- frontend-next/app/inspection-review/
- frontend-next/app/inspection-cover/
- frontend-next/app/inspection-quick/
- frontend-next/app/inspection-walkthrough/
- frontend-next/components/inspection/

Known integrated capabilities:

- Inspection setup/cover flow.
- Hazard description capture.
- Evidence/photo sections.
- SafeScope review step.
- Finding review/editor.
- Finalize inspection/report flow.
- Risk display.
- Standards display.
- Corrective action display.
- SafeScope reasoning panels.
- Report preference toggles.
- Audit/traceability display.

Status:

- Integrated.
- Frontend build verified.

Open improvement areas:

- Field-test inspection flow end to end.
- Confirm report generation output against desired final report design.
- Confirm photo/evidence persistence behavior.
- Confirm inspection assignment behavior for Company tier.

---

## 5. Backend Application

Primary backend source:

- backend/src/

Important backend areas:

- backend/src/app.module.ts
- backend/src/database/
- backend/src/reports/
- backend/src/actions/
- backend/src/auth/
- backend/src/applicable-standards/
- backend/src/safescope/
- backend/src/safescope-v2/
- backend/src/safescope-knowledge/
- backend/src/safescope-source-intelligence/

Status:

- Integrated.
- Backend build verified.

---

## 6. SafeScope Engine

Active SafeScope v2 source:

- backend/src/safescope-v2/

SafeScope v2 is the active intelligence foundation.

Key areas:

- backend/src/safescope-v2/orchestration/
- backend/src/safescope-v2/understanding/
- backend/src/safescope-v2/brain/
- backend/src/safescope-v2/equipment-knowledge/
- backend/src/safescope-v2/knowledge-intake/
- backend/src/safescope-v2/reference-intelligence/
- backend/src/safescope-v2/validation/

Legacy bridge/adapters:

- backend/src/safescope/

Status:

- Active.
- Build verified.
- Advisory guardrails preserved.

---

## 7. SafeScope Observation Understanding

Primary locations:

- backend/src/safescope-v2/understanding/observation-understanding.service.ts
- backend/src/safescope-v2/understanding/scenario-understanding.service.ts
- backend/src/safescope-v2/understanding/equipment-understanding.service.ts
- backend/src/safescope-v2/understanding/task-understanding.service.ts
- backend/src/safescope-v2/understanding/exposure-understanding.service.ts
- backend/src/safescope-v2/understanding/energy-understanding.service.ts
- backend/src/safescope-v2/understanding/control-understanding.service.ts
- backend/src/safescope-v2/understanding/safescope-understanding.types.ts

Known integrated capabilities:

- Normalizes raw hazard observations.
- Detects jurisdiction signals.
- Detects equipment/category/component.
- Detects task/activity.
- Detects worker exposure.
- Detects energy source.
- Detects missing/failed controls.
- Produces mechanism candidates.
- Produces scenario understanding candidates.
- Produces evidence gaps.
- Keeps advisory guardrails.

Latest verified improvement:

- Precision Batch 003 scenario understanding expansion.

Status:

- Integrated.
- Core validations passed.

---

## 8. SafeScope Precision Benchmarks

Primary benchmark data location:

- safescope-data/benchmarks/

Primary runner location:

- backend/scripts/

Known precision batches:

- safescope-precision-batch-001.v1.json
- safescope-precision-batch-001-results.v1.json
- safescope-precision-batch-002.v1.json
- safescope-precision-batch-002-results.v1.json
- safescope-precision-batch-003.v1.json
- safescope-precision-batch-003-results.v1.json

Latest verified precision status:

- Batch 001: 10/10 across hazardFamily, scenarioFamily, mechanism, riskBand, and standardFamily.
- Batch 002: 10/10 across hazardFamily, scenarioFamily, mechanism, riskBand, and standardFamily.
- Batch 003: 10/10 across hazardFamily, scenarioFamily, mechanism, riskBand, and standardFamily.

Batch 003 covered:

- Fall protection / unprotected edge.
- Open floor hole fall exposure.
- Fire extinguisher emergency readiness.
- Lockout/tagout / unexpected startup.
- HazCom label/SDS gap.
- Confined space entry controls.
- Suspended load / crane rigging line-of-fire.
- Stored pressure / pressurized hose failure.

Status:

- Batch 003 green.
- Prior batches still green.
- Core understanding and output contract validations passed.

---

## 9. SafeScope Scenario Intelligence

Primary locations:

- backend/src/safescope-v2/brain/scenario-intelligence/
- backend/src/safescope-v2/brain/scenario-family-knowledge/
- backend/src/safescope-v2/brain/scenario-disambiguation/
- backend/src/safescope-v2/understanding/scenario-understanding.service.ts

Known integrated scenario families include:

- Conveyor cleanup near moving parts.
- Unguarded conveyor pulley.
- Rotating shaft guarding.
- Point-of-operation guarding.
- Electrical panel access.
- Damaged cord / wet location.
- Excavation protective system.
- Mobile equipment / pedestrian interaction.
- Fall protection / unprotected edge.
- Fire extinguisher access/inspection.
- Housekeeping slip/trip.
- LOTO unexpected startup / energy isolation.
- HazCom label/SDS gap.
- Permit-required confined space entry.
- Suspended load line-of-fire.
- Pressurized hose failure.

Status:

- Expanded through Precision Batch 003.
- Needs continued benchmark expansion across more field-realistic cases.

---

## 10. SafeScope Risk Reasoning

Primary locations:

- backend/src/safescope-v2/brain/risk-reasoning/
- backend/src/safescope-v2/risk/

Known integrated capabilities:

- Infers severity.
- Infers likelihood.
- Calculates initial risk level.
- Identifies credible worst-case outcome.
- Builds risk drivers.
- Builds risk reducers.
- Determines urgency.
- Suggests due date logic.
- Lists verification requirements.
- Preserves advisory guardrails.

Status:

- Integrated.
- Batch 003 riskBand verified 10/10.

Open improvement areas:

- Validate risk bands against larger realistic field datasets.
- Keep risk calibration separate from citation/violation determinations.
- Expand critical/high/moderate examples for each hazard family.

---

## 11. SafeScope Standards and Regulatory Reasoning

Primary locations:

- backend/src/safescope-v2/standards-intelligence/
- backend/src/safescope-v2/standards-reasoning/
- backend/src/safescope-v2/standards-intent-intelligence/
- backend/src/safescope-v2/regulatory-applicability/
- backend/src/safescope-v2/brain/regulatory-brain/
- backend/src/safescope-v2/brain/standard-family-mapper/
- backend/src/applicable-standards/

Known integrated capabilities:

- Candidate standard family mapping.
- Standards reasoning.
- Citation review brain.
- Regulatory applicability signals.
- Standard intent profiling.
- Approved-knowledge bridge support.
- Advisory-only compliance boundary.

Status:

- Integrated.
- Batch 003 standardFamily verified 10/10 for tested scenarios.

Open improvement areas:

- Expand approved source population.
- Improve citation-level selection after standard-family selection.
- Continue separating standard-family match from final citation determination.
- Strengthen MSHA/OSHA jurisdiction-specific ranking.

---

## 12. SafeScope Corrective Actions

Primary locations:

- backend/src/safescope-v2/brain/corrective-action-brain/
- backend/src/safescope-v2/corrective-actions/
- backend/src/safescope-v2/intelligence/corrective-action-intelligence.ts
- backend/src/safescope-v2/action-quality/
- backend/src/safescope-v2/action-effectiveness/
- frontend-next/components/inspection/SafeScopeActionEffectivenessSection.tsx

Known integrated capabilities:

- Corrective action reasoning.
- Control hierarchy themes.
- Action quality review.
- Action effectiveness logic.
- Report/display integration.

Status:

- Integrated.
- Needs broader scenario-specific action specificity expansion.

---

## 13. SafeScope Knowledge and Source Governance

Primary locations:

- backend/src/safescope-knowledge/
- backend/src/safescope-source-intelligence/
- backend/src/safescope-v2/knowledge-intake/
- research/safescope-knowledge/
- safescope-data/source-intelligence/

Known integrated capabilities:

- Source registry.
- Source roles.
- Source governance checks.
- Approved knowledge pathway.
- Knowledge review workflow.
- Approved knowledge bridge.
- Approved knowledge integration adapter.
- Source ingestion preview.
- Quarantine/approved record pattern.

Status:

- Foundation integrated.
- Approved-source population remains a major expansion area.

Open improvement areas:

- Populate more approved MSHA, OSHA, NIOSH, and authoritative safety records.
- Keep duplicates out.
- Keep harvested candidates separate from approved intelligence.
- Add source freshness and review cadence rules.

---

## 14. SafeScope Learning and Review Governance

Primary locations:

- backend/src/safescope-v2/learning/
- backend/src/safescope-v2/learning-memory/
- backend/src/safescope-v2/brain/learning-memory/
- backend/src/safescope-v2/brain/reviewer-feedback-queue/
- backend/src/safescope-v2/validation/

Known integrated capabilities:

- Reviewer feedback queue.
- Learning candidate generation.
- Learning memory service.
- Workspace learning service.
- Learning governance service.
- Supervisor validation records.
- Reasoning drift support.
- Confidence calibration support.

Important rule:

- SafeScope should learn through governed review, not uncontrolled self-modification.

Status:

- Foundation integrated.
- Needs continued hardening before allowing autonomous learning behavior.

---

## 15. Evidence, Confidence, and Explainability

Primary locations:

- backend/src/safescope-v2/brain/evidence-brain/
- backend/src/safescope-v2/brain/evidence-gap-intelligence/
- backend/src/safescope-v2/brain/evidence-gap-question-generator/
- backend/src/safescope-v2/brain/decision-confidence/
- backend/src/safescope-v2/confidence/
- backend/src/safescope-v2/evidence-quality/
- backend/src/safescope-v2/evidence-sufficiency/
- backend/src/safescope-v2/explainability/
- frontend-next/components/inspection/SafeScopeConfidenceReasonCodes.tsx
- frontend-next/components/inspection/SafeScopeDecisionExplainabilitySection.tsx
- frontend-next/components/inspection/SafeScopeEvidenceQuality.tsx

Known integrated capabilities:

- Evidence quality.
- Evidence sufficiency.
- Evidence gaps.
- Evidence questions.
- Confidence scoring.
- Decision explainability.
- Audit/reasoning traces.

Status:

- Integrated.
- Needs continued real-world validation with photo/evidence workflows.

---

## 16. Reference Intelligence Domains

Primary location:

- backend/src/safescope-v2/reference-intelligence/

Known reference intelligence modules:

- confined-space
- cross-domain
- electrical
- hazcom-ghs
- lifting-rigging
- loto
- mobile-equipment
- trenching

Status:

- Integrated.
- Needs continued expansion and benchmark coverage.

---

## 17. Validation and Gauntlet Workspace

Workspace map:

- project-docs/06-validation-and-gauntlets/SAFESCOPE_VALIDATION_WORKSPACE_MAP.md

Primary script location:

- backend/scripts/

Primary data locations:

- safescope-data/benchmarks/
- safescope-data/gauntlets/
- safescope-data/source-intelligence/
- backend/test-data/scenario-bank/
- backend/tests/regression/

Important validation categories:

- Build validation.
- Output contract validation.
- Observation understanding validation.
- Scenario precision batches.
- Field realism gauntlets.
- Knowledge pipeline validation.
- Source governance validation.
- Standards mapping validation.
- Corrective action validation.
- Reviewer feedback validation.

Status:

- Organized and documented.

---

## 18. Company Tier and Entitlement Logic

Primary locations:

- backend/src/auth/entitlements/
- frontend-next/app/company/
- frontend-next/app/actions/
- frontend-next/app/settings/
- frontend-next/app/settings/workspace/

Known integrated product intent:

- Company plan should support account owner/admin workflows.
- Add users.
- Assign roles.
- Manage seats.
- Assign inspections.
- Assign follow-ups.
- Assign corrective actions.
- Filter company/workspace data.

Status:

- Product direction documented.
- Needs full end-to-end account/team validation.

---

## 19. Report Generation and Report-Ready Intelligence

Primary locations:

- backend/src/reports/
- frontend-next/app/reports/
- frontend-next/components/inspection/GenerateReportSection.tsx
- frontend-next/components/inspection/FinalizeInspectionSection.tsx
- backend/src/safescope-v2/brain/narrative-generator/

Known integrated capabilities:

- Inspection findings.
- Executive-style report sections.
- SafeScope report narrative support.
- Report preference toggles.
- Report-ready narrative generator foundation.
- Audit trace and reasoning appendix concepts.

Status:

- Partially integrated.
- Needs final report design validation and export testing.

---

## 20. Current Uncommitted SafeScope Work

Likely active uncommitted work:

- backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts
- backend/src/safescope-v2/understanding/scenario-understanding.service.ts
- backend/scripts/run-safescope-precision-batch-003.ts
- safescope-data/benchmarks/safescope-precision-batch-003.v1.json
- safescope-data/benchmarks/safescope-precision-batch-003-results.v1.json
- safescope-data/benchmarks/safescope-precision-batch-001-results.v1.json
- safescope-data/benchmarks/safescope-precision-batch-002-results.v1.json

Purpose:

- Precision Batch 003: scenario understanding expansion and standard/risk calibration for fall protection, LOTO, HazCom, confined space, rigging, and stored pressure cases.

Known result:

- Batch 001 green.
- Batch 002 green.
- Batch 003 green.
- Backend build passed.
- Core understanding validations passed.
- Field output contract validation passed.

Suggested commit message:

- Expand SafeScope precision scenario understanding

---

## 21. Known Cleanup Rules

Before major edits:

1. Check git status.
2. Keep active source in place.
3. Keep benchmark data in safescope-data/.
4. Keep docs in project-docs/.
5. Archive one-time prompt files in project-docs/09-archive-reference/prompts/.
6. Ignore generated build output unless specifically needed.
7. Run backend build after backend edits.
8. Run frontend build after frontend edits.
9. Run targeted validation scripts before committing.
10. Do not push or deploy unless explicitly requested.

---

## 22. Next Capability Expansion Candidates

High-value next areas:

1. Approved-source population expansion.
2. Citation-level standard ranking.
3. Larger field-realism benchmark sets.
4. Corrective action specificity by hazard family.
5. Photo/evidence-based inspection flow validation.
6. Report export quality and executive summary polish.
7. Company-tier team/assignment workflows.
8. Supervisor validation and governed learning workflow.
9. Risk calibration across more industries and severity bands.
10. Release-readiness QA checklist.

---

## 23. Quick Command Reference

Backend build:

    cd backend
    npm run build

Frontend build:

    cd frontend-next
    npm run build

Run precision batch 003:

    cd backend
    npx ts-node scripts/run-safescope-precision-batch-003.ts

Run core understanding validations:

    cd backend
    npx ts-node scripts/validate-safescope-observation-understanding.ts
    npx ts-node scripts/validate-safescope-understanding-engine.ts
    npx ts-node scripts/validate-safescope-main-output-observation-understanding.ts
    npx ts-node scripts/validate-safescope-observation-trace-snapshot.ts
    npx ts-node scripts/validate-safescope-field-output-contract.ts

Check git status:

    git status --short
