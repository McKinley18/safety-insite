# SafeScope Validated AI Transition Plan

This document defines the path for moving SafeScope from a deterministic safety intelligence engine into a validated, defensible safety AI system.

Last updated: 2026-06-06

---

## 1. Current Position

SafeScope currently functions as a deterministic, advisory-only safety intelligence engine inside Sentinel Safety.

It can evaluate hazard observations, infer hazard families, identify likely scenario families, reason about mechanisms of injury, estimate risk bands, suggest standard families, surface evidence gaps, and generate safety-oriented corrective-action logic.

SafeScope is not currently positioned as an autonomous regulatory decision maker.

Current boundary:

- Advisory only.
- Does not declare violations.
- Does not create citations.
- Does not replace qualified safety review.
- Requires human validation before final reliance.

---

## 2. Current Verified Foundation

Validated capabilities currently include:

- Observation understanding.
- Scenario understanding.
- Mechanism-of-injury reasoning.
- Hazard family routing.
- Standard family routing.
- Risk band calibration.
- Evidence gap generation.
- Field output contract validation.
- Observation trace snapshot validation.
- SafeScope precision benchmark batches 001, 002, and 003.

Latest verified benchmark state:

- Precision Batch 001: 10/10 exact matches.
- Precision Batch 002: 10/10 exact matches.
- Precision Batch 003: 10/10 exact matches.

Each batch currently checks:

- Hazard family.
- Scenario family.
- Mechanism.
- Risk band.
- Standard family.

---

## 3. What “Validated, Defensible AI” Means

SafeScope should only be described as validated and defensible when it can show repeatable performance across controlled tests, realistic field-like observations, negative cases, source-backed regulatory mappings, and documented human-review workflows.

A validated SafeScope decision should be able to answer:

1. What observation was evaluated?
2. What facts did SafeScope extract?
3. What hazard family was selected?
4. What scenario family was selected?
5. What mechanism of injury was inferred?
6. What standard family was considered relevant?
7. What evidence was missing?
8. What assumptions were avoided?
9. What controls were recommended?
10. What confidence level was assigned?
11. What proof exists that this behavior has been tested?
12. What human review is required before final reliance?

---

## 4. Required Capability Tracks

### Track A: Scenario Understanding Expansion

Goal:

Build broader domain coverage so SafeScope can recognize more real-world safety observations without collapsing into generic categories.

Required work:

- Expand scenario families by domain.
- Add domain-specific scenario IDs.
- Add mechanism-of-injury mappings.
- Add control failure patterns.
- Add worker exposure patterns.
- Add competing scenario rules.
- Add false-positive prevention rules.

Priority domains:

- Fall protection.
- Lockout/tagout and stored energy.
- Machine guarding.
- Mobile equipment and powered haulage.
- Electrical.
- Hazard Communication.
- Confined space.
- Lifting and rigging.
- Fire protection and emergency equipment.
- Emergency egress.
- Excavation and trenching.
- Material handling.
- Walking-working surfaces.
- PPE.
- Hot work.
- Respiratory / air contaminants.
- Noise and health exposures.

Acceptance standard:

Each scenario family should have positive tests, negative tests, evidence-gap tests, and at least one realistic field-style observation.

---

### Track B: Benchmark and Gauntlet Validation

Goal:

Move beyond small curated green batches into broader defensibility testing.

Required benchmark types:

- Precision batches.
- Recall batches.
- False-positive gauntlets.
- False-negative gauntlets.
- Ambiguity gauntlets.
- Cross-domain conflict gauntlets.
- Field realism batches.
- Source mapping validation batches.
- Regression protection batches.

Minimum target structure:

- 100-case mixed-domain baseline.
- 200-case field realism benchmark.
- 500-case regression bank.
- Domain-specific mini-gauntlets for each major hazard family.
- Dedicated adversarial ambiguity tests.

Acceptance standard:

SafeScope should not only get the expected answer when the observation is clear. It should also know when not to overreach.

---

### Track C: Source-Backed Regulatory Mapping

Goal:

Make standards suggestions traceable to approved sources instead of generic category matching.

Required work:

- Build approved source registry.
- Track source authority tier.
- Track citation family.
- Track applicability triggers.
- Track exclusion conditions.
- Track evidence required before suggesting a standard.
- Separate “standard family candidate” from “specific citation candidate.”
- Add source version and review metadata.
- Prevent duplicate or stale source records.

Required source governance fields:

- Agency or authority.
- Citation.
- Title.
- Source URL or reference.
- Effective date or review date.
- Applicability triggers.
- Non-applicability triggers.
- Required evidence.
- Related hazard families.
- Related mechanisms.
- Human review notes.
- Approval status.

Acceptance standard:

SafeScope can explain why a standard family or citation candidate was considered, what evidence supports it, and what evidence is still missing.

---

### Current foundation added: Causal-Risk Reasoning Core

SafeScope now includes a causal-risk reasoning core as a foundation for defensible AI behavior.

This layer is designed to reason from reusable safety primitives instead of memorized scenario answers. It evaluates energy source, energy-transfer path, exposed target, initiating condition, failed or missing controls, mechanism of injury, credible worst case, competing mechanisms, missing evidence, and confidence.

This should become a central bridge between observation understanding, evidence sufficiency, risk reasoning, corrective action logic, and future source-backed regulatory mapping.


### Current foundation added: Evidence Sufficiency Engine

SafeScope now includes an Evidence Sufficiency Engine as the next defensibility layer after causal-risk reasoning.

This layer evaluates whether the observation contains enough facts to support strong reasoning. It scores observation clarity, equipment, task, exposure, energy, control failure, mechanism, jurisdiction, and supporting evidence. It also recommends reviewer questions when critical facts are missing and limits the maximum supported confidence when evidence is weak.

This should become the main gate between SafeScope's reasoning layers and any future stronger classification, risk, corrective-action, or source-backed regulatory mapping behavior.


### Current foundation added: Confidence Governance Core

SafeScope now includes a Confidence Governance Core as the output governor that decides how strongly SafeScope may speak.

This layer sits above all reasoning and intelligence engines. It enforces the advisory-only boundary, prevents weak evidence from being presented as high-confidence conclusions, and determines whether SafeScope can support strong recommendations, standard-family suggestions, citation candidates, corrective actions, and report narratives.

This should become the final check before any output is passed to the frontend or reporting engines.


### Track D: Evidence Sufficiency and Confidence

Goal:

Prevent SafeScope from presenting weak outputs as strong conclusions.

Required work:

- Define evidence requirements per scenario family.
- Score observation quality.
- Score exposure clarity.
- Score equipment clarity.
- Score task clarity.
- Score control failure clarity.
- Score jurisdiction clarity.
- Score regulatory applicability confidence.
- Add confidence downgrade rules.
- Add “not enough information” behavior.

Required confidence states:

- High confidence.
- Moderate confidence.
- Low confidence.
- Insufficient evidence.
- Human review required.

Acceptance standard:

SafeScope must produce stronger answers only when enough facts are present. When facts are missing, it must ask better questions instead of guessing.

---

### Current foundation added: Output Policy Governor

SafeScope now includes an Output Policy Governor as the final language-strength gate before output is presented.

This layer uses confidence governance, evidence sufficiency, causal-risk reasoning, and observation understanding to decide how strongly SafeScope may speak. It controls whether outputs may present likely hazards, possible hazards, immediate controls, permanent controls, standard-family references, citation candidates, executive narrative, and corrective-action text.

This should become the main bridge between SafeScope's internal reasoning and user-facing language so weak evidence cannot become overconfident report wording.


### Track E: Corrective Action Defensibility

Goal:

Make corrective actions specific, practical, and tied to the hazard mechanism.

Required work:

- Tie actions to hazard family.
- Tie actions to mechanism of injury.
- Tie actions to failed control.
- Separate immediate action from permanent correction.
- Add verification requirements.
- Add responsible-party and due-date logic.
- Avoid generic corrective action language.
- Add hierarchy-of-controls reasoning.

Corrective action structure:

- Immediate protective action.
- Permanent corrective action.
- Verification evidence.
- Responsible role.
- Suggested urgency.
- Residual risk expectation.
- Follow-up requirement.

Acceptance standard:

Corrective actions should read like they were written by a competent safety professional, not like generic safety boilerplate.

---

### Current foundation added: Defensible Corrective Action Core

SafeScope now includes a Defensible Corrective Action Core as the layer that converts internal reasoning into practical, evidence-governed corrective actions.

This layer uses causal-risk reasoning, evidence sufficiency, confidence governance, output policy, failed controls, exposure, mechanism of injury, credible worst case, and verification needs to separate immediate actions, interim controls, permanent corrective actions, verification steps, reviewer questions, and blocked actions.

This should become the main corrective-action bridge between SafeScope reasoning and user-facing inspection reports while preventing weak evidence from becoming overconfident final-action language.


### Current foundation added: Human Review and Learning Governance Core

SafeScope now includes a Human Review and Learning Governance Core as the layer that controls reviewer correction capture and prevents unsafe automatic learning.

This layer determines what requires qualified human review, what reviewer corrections should be captured, whether a correction is blocked, review-required, or an approved learning candidate, and what audit trail is required before future knowledge updates.

This should become the governance bridge between reviewer feedback, future learning workflows, and approved knowledge management. It does not automatically write learned knowledge into the approved knowledge base.

### Current foundation added: Source-Backed Applicability Governance Core

SafeScope now includes a Source-Backed Applicability Governance Core as the layer that controls whether SafeScope may discuss standard families, citation candidates, and applicability reasoning.

This layer uses evidence sufficiency, confidence governance, output policy, jurisdiction clarity, candidate standard families, citation candidates, and source support as gates. It allows standard-family discussion only when the evidence and jurisdiction support it, and it blocks citation-candidate language unless source support and qualified-review requirements are satisfied.

This should become the bridge between SafeScope reasoning and future approved-source regulatory mapping. It is not a citation generator and does not declare violations.



### Current foundation added: Approved Knowledge Registry Write Guard

SafeScope now includes an Approved Knowledge Registry Write Guard as the final gate before any knowledge can be written to the approved registry.

This layer uses approved source intake governance, approved knowledge promotion workflow governance, reviewer approval, audit trail, duplicate resolution, versioning, and change reason controls to decide whether a record may become a draft candidate, must be held for review, must be rejected, or may become an approved-registry write candidate.

It does not persist approved knowledge, does not automatically promote source records, and does not weaken SafeScope advisory-only boundaries.


### Track F: Human Review and Learning Governance

Goal:

Allow SafeScope to improve without silently learning bad information.

Required work:

- Capture reviewer corrections.
- Capture accepted/rejected SafeScope suggestions.
- Capture corrected hazard family.
- Capture corrected mechanism.
- Capture corrected standard family.
- Capture corrected risk band.
- Track reviewer confidence.
- Track reason for override.
- Route feedback into a review queue.
- Require approval before updating validated knowledge.

Governance rules:

- Field feedback should not automatically change validated behavior.
- New learning should be staged.
- Staged learning should be tested.
- Tested learning should require approval.
- Approved learning should be versioned.
- Unsafe or unsupported learning should be rejected.

Acceptance standard:

SafeScope can learn from use, but only through controlled, reviewable, testable governance.

---

### Track G: Traceability and Audit Defense

Goal:

Every SafeScope output should be explainable after the fact.

Required work:

- Preserve observation trace.
- Preserve extracted facts.
- Preserve candidate rankings.
- Preserve rejected candidates.
- Preserve evidence gaps.
- Preserve source candidates.
- Preserve final selected output.
- Preserve confidence calculation.
- Preserve human review decision.
- Preserve version metadata.

Acceptance standard:

A reviewer should be able to reconstruct why SafeScope produced its answer.

---

### Track H: Product Integration

Goal:

Expose SafeScope maturity inside Sentinel Safety without overwhelming the user.

Required work:

- Display SafeScope confidence clearly.
- Display evidence gaps clearly.
- Display supervisor questions.
- Display advisory-only boundary.
- Display source-backed reasoning when available.
- Display corrective-action verification steps.
- Allow reviewer override.
- Save review feedback.
- Include traceability appendix in reports.
- Separate simple user view from advanced reviewer view.

Acceptance standard:

The frontend should make SafeScope useful in the field while still protecting defensibility.

---

## 5. Maturity Levels

### Level 1: Deterministic Assistant

Status: mostly achieved.

SafeScope can classify and reason through curated observations with deterministic outputs.

### Level 2: Validated Scenario Engine

Status: in progress.

SafeScope has benchmarked scenario understanding across multiple domains with repeatable exact-match results.

### Level 3: Source-Grounded Advisory AI

Status: not complete.

SafeScope uses approved source-backed regulatory mappings with evidence sufficiency and applicability limits.

### Level 4: Field-Validated Safety AI

Status: not complete.

SafeScope is tested against real-world inspection observations, reviewer feedback, and field outcomes.

### Level 5: Defensible Safety Intelligence System

Status: target state.

SafeScope has documented validation, source governance, audit traceability, reviewer oversight, controlled learning, and release-readiness criteria.

---

## 6. Immediate Next Steps

1. Build the 100-case mixed-domain baseline.
2. Add false-positive and false-negative gauntlets.
3. Expand source-backed standard family mapping.
4. Add evidence sufficiency scoring per scenario family.
5. Add reviewer feedback capture and staged learning queue.
6. Add validation summaries to the Capability Index after each checkpoint.
7. Keep all validated behavior tied to tests before calling it complete.

---

## 7. Definition of Done for SafeScope AI Transition

SafeScope can be called a validated, defensible safety AI only when:

- Core domains have scenario coverage.
- Benchmarks include positive, negative, ambiguous, and field-realistic cases.
- Source-backed standard mapping is traceable.
- Evidence sufficiency is scored.
- Confidence is calibrated.
- Corrective actions are mechanism-specific.
- Human review workflow is built.
- Reviewer feedback is governed.
- Regression tests protect previous wins.
- Reports preserve audit traceability.
- The Capability Index records verified status.
- The system continues to preserve advisory-only boundaries.


- The Approved Source Knowledge Intake Governance Core is now the layer that controls whether external source material is eligible to become an approved knowledge candidate.

- The Approved Knowledge Promotion Workflow Governance Core controls whether approved source candidates are ready for final review, merge review, escalation, revision, or blocking before any future approved knowledge update.
