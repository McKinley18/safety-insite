# Gemini Prompt: Build SafeScope Expert Reasoning Blueprint

You are working in the active Sentinel Safety repository:

/Users/mckinley/Sentinel_Safety

Do not delete files. Do not move files. Do not commit. Do not push. Do not deploy.

Your task is to create a detailed SafeScope Expert Reasoning Blueprint that will guide future development of SafeScope into a more accurate, defensible, expert-level safety reasoning engine.

## Goal

Create this file:

project-docs/08-audits/SAFESCOPE_EXPERT_REASONING_BLUEPRINT.md

The blueprint must explain exactly how SafeScope should be strengthened beyond simple taxonomy matching into a governed safety and health expert reasoning system.

## Current Context

SafeScope is currently a deterministic/hybrid expert reasoning system inside Sentinel Safety. Recent audit work identified these improvement areas:

1. Taxonomy alignment
2. Mechanism normalization
3. Citation fidelity
4. Corrective action specificity
5. Confidence calibration
6. Evidence sufficiency
7. Expert-level decision making

SafeScope should remain defensible, auditable, and safety-professional-grade. Do not recommend vague AI features unless they are tied to a controlled, testable safety use case.

## Blueprint Requirements

Create a professional markdown document with the following sections:

# SafeScope Expert Reasoning Blueprint

## 1. Executive Summary

Explain what SafeScope should become: an inspection/audit reasoning engine that thinks like a safety and health expert.

## 2. Current SafeScope Classification

Explain whether SafeScope is currently:
- deterministic expert system
- hybrid AI-ready expert system
- true AI
- AI-assisted safety reasoning platform

Be precise and realistic.

## 3. Expert Reasoning Checklist

Define the required reasoning sequence SafeScope should follow for every finding:

1. Hazard identity
2. Energy source / harm mechanism
3. Exposure pathway
4. Operational state
5. Jurisdiction and industry context
6. Applicable standard
7. Immediate danger / stop-work need
8. Missing evidence
9. Corrective action hierarchy
10. Verification evidence required
11. Confidence score and confidence reason codes
12. Human review trigger

## 4. Canonical Taxonomy Model

Define the recommended taxonomy structure:

Domain → Hazard Family → Mechanism → Exposure Pathway → Control Failure → Standards → Corrective Actions → Verification Evidence

Include examples for:
- machine guarding
- electrical
- excavation/trenching
- ground/roof control
- walking-working surfaces
- mobile equipment
- confined spaces
- hazardous energy/LOTO
- chemical exposure
- fire/emergency preparedness

## 5. Failure Mode Registry

Define how SafeScope should maintain known real-world failure modes.

Include examples such as:
- missing guard
- exposed nip point
- damaged electrical enclosure
- trench without protective system
- loose roof or rib
- missing berm
- blocked emergency access
- uncontrolled hazardous energy
- missing fall protection
- incompatible chemical storage

## 6. Immediate Danger / Stop-Work Logic

Define deterministic rules SafeScope should use to decide whether a condition needs immediate control.

Include examples for:
- exposed energized parts
- unguarded moving parts with worker exposure
- unsupported trench
- loose roof/rib in travelway
- fall exposure
- hazardous atmosphere
- mobile equipment/personnel interaction

## 7. Standards Applicability Logic

Define how SafeScope should select a primary citation and acceptable secondary citations.

Explain that SafeScope should consider:
- jurisdiction
- mine type or industry type
- work area
- equipment
- task
- exposure
- standard scope
- citation specificity
- whether a broader general duty rule should be secondary, not primary

## 8. Corrective Action Quality Model

Define how SafeScope should generate corrective actions using:
- immediate control
- permanent correction
- hierarchy of controls
- responsible party
- due date urgency
- verification evidence
- follow-up inspection
- recurrence prevention

Include good and bad examples.

## 9. Evidence Sufficiency Model

Define how SafeScope should identify missing evidence.

Examples:
- photo missing
- measurement missing
- energized/de-energized status unknown
- worker exposure unknown
- mine type unknown
- task unclear
- equipment type unclear
- depth/soil type missing for excavation
- atmosphere testing missing for confined space

## 10. Confidence Calibration Model

Define when SafeScope should return high, moderate, low, or insufficient confidence.

High confidence should require:
- strong hazard match
- strong mechanism match
- strong jurisdiction match
- primary citation fit
- specific corrective action fit
- enough evidence

SafeScope should not return high confidence when citation, mechanism, or exposure is missing.

## 11. Human Review Triggers

Define conditions that should force human review:
- low confidence
- conflicting jurisdiction
- serious injury/fatality potential
- stop-work recommendation
- missing critical evidence
- ambiguous standard applicability
- high-risk corrective action
- repeated findings
- possible citation uncertainty

## 12. Learning and Growth Loop

Define how SafeScope should improve over time without becoming unsafe.

Include:
- supervisor validation
- accepted/rejected classifications
- corrected citations
- corrected corrective actions
- benchmark expansion
- regression tests
- audit trails
- versioned knowledge updates
- no silent model changes in production

## 13. AI Upgrade Path

Explain the safest path from deterministic expert system to AI-enhanced system.

Include these stages:
1. governed deterministic expert system
2. benchmarked reasoning engine
3. human feedback learning loop
4. retrieval-augmented safety knowledge layer
5. optional LLM-assisted drafting layer
6. predictive analytics layer
7. validated AI-assisted safety reasoning system

Explain that AI should assist, not replace, governed deterministic safety logic.

## 14. Accuracy Measurement Plan

Define how accuracy should be measured:
- hazard classification accuracy
- mechanism accuracy
- citation accuracy
- corrective action appropriateness
- confidence calibration
- evidence gap detection
- false positive rate
- false negative rate
- high-risk miss rate
- human review agreement rate

## 15. Benchmark Expansion Plan

Recommend expanding the benchmark from 4 cases to at least:
- 25 core cases
- 100 field-realistic cases
- 500 mixed industry cases
- 1,000+ regression cases over time

Group benchmark cases by MSHA, OSHA General Industry, OSHA Construction, and mixed/ambiguous cases.

## 16. Recommended Build Order

Provide a clear build order for strengthening SafeScope:

1. Canonical taxonomy alignment
2. Mechanism registry expansion
3. Standards applicability registry expansion
4. Corrective action templates
5. Evidence sufficiency rules
6. Confidence calibration
7. Human review triggers
8. Benchmark expansion
9. Learning loop
10. AI-assisted layer

## 17. Files/Folders To Review

Review and reference relevant files/folders where applicable:
- backend/src/safescope-v2/
- backend/src/safescope-v2/reasoning-orchestrator/
- backend/src/safescope-v2/taxonomy/
- backend/src/safescope-v2/standards/
- backend/src/safescope-v2/corrective-actions/
- backend/src/safescope-v2/mechanism-intelligence/
- safescope-data/benchmarks/
- project-docs/08-audits/
- tools/safescope-gauntlet/

## 18. Implementation Notes

Recommend how future Gemini sessions should implement this blueprint safely:
- small changes
- run audit after each change
- run production readiness after each change
- do not commit until reviewed
- preserve existing passing build
- document every scoring change

## Output Rules

Create only the markdown blueprint file. Do not modify application code. Do not commit. Do not push.

After creating the file, print:
1. The file path
2. A 20-line preview
3. git status --short
