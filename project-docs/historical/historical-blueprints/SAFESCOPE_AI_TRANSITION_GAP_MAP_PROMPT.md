You are working in the Sentinel Safety repo.

Goal:
Create a SafeScope AI Transition Gap Map that inspects the current repository and identifies what remains before SafeScope can reasonably be described as a more complete governed safety AI.

This is a planning/documentation + validator inventory task only.
Do not create new domain packs.
Do not create new AI behavior.
Do not remove guardrails.
Do not push.
Do not deploy.
Commit locally only if validation passes.

Current checkpoint:
- Local HEAD includes: Add SafeScope HazCom chemical labeling SDS draft pack.
- origin/main is behind by at least one local commit.
- Work must remain local after this task.

Important boundaries:
SafeScope remains advisory-only.
SafeScope must not declare violations.
SafeScope must not create citations.
SafeScope must require qualified human review.
Draft candidates must not be treated as approved knowledge.
No automatic learning.
No automatic promotion.
No runtime persistence of approved knowledge unless already explicitly implemented.
No external network calls.

Task:
Build a repo-inspection based transition gap map.

Create:

1. project-docs/04-safescope-engine/SAFESCOPE_AI_TRANSITION_GAP_MAP.md

This document must include:

A. Current AI foundation inventory
- Existing governance systems
- Existing validation systems
- Existing draft knowledge packs
- Existing approved knowledge registry/search/IO scaffolds
- Existing orchestrator integration points
- Current master validation count and included validators

B. Draft knowledge pack inventory
For each draft pack under:
safescope-data/approved-knowledge/draft-candidates/

List:
- file name
- packId
- status
- record count
- whether every record is draft_candidate
- whether validator exists
- whether validator is included in backend/scripts/run-safescope-full-validation.ts
- broad domain covered

C. Duplicate / cleanup findings
Identify:
- duplicate-looking commits in git log
- repeated confined-space/electrical entries if visible
- any duplicate validator labels or duplicate master runner entries
- any repeated documentation sections
- any stale benchmark timestamp-only churn issue
Do not rewrite git history.
Just document cleanup recommendations.

D. Remaining core AI transition gaps
Assess what is still missing in practical terms, including:
- source-backed approved knowledge population
- reviewer approval workflow UI/API
- approved knowledge promotion from draft to approved
- evidence-to-standard retrieval using approved records
- richer field output generation from approved records
- MSHA/OSHA citation confidence boundaries
- larger domain coverage
- contradiction and ambiguity resolution
- continuous validation/golden test expansion
- analytics feedback loop
- company policy integration
- offline/mobile inspection workflow integration
- audit trail and versioning for knowledge reviews

E. Recommended next build order
Create a prioritized local-only roadmap:
Phase 1: cleanup/inventory hardening
Phase 2: approved knowledge review UI/API
Phase 3: approved registry promotion workflow
Phase 4: approved-record retrieval in orchestrator output
Phase 5: domain pack expansion
Phase 6: field testing and safety professional review loop
Phase 7: production governance and release readiness

F. Definition of “full AI status” for SafeScope
Define practical criteria:
- not artificial general intelligence
- governed safety AI assistant
- source-backed reasoning
- reviewer-controlled learning
- deterministic guardrails
- evidence-aware recommendations
- jurisdiction-aware applicability
- defensible advisory outputs
- validated regression suite

2. backend/scripts/audit-safescope-ai-transition-gap-map.ts

This script must inspect actual repo files and print:
- draft pack count
- draft candidate record total
- validator count for draft packs
- master runner validator count
- missing validator entries
- missing pack files
- duplicate master runner labels if found

The script should fail with process.exit(1) if:
- any draft pack has zero records
- any draft pack has non-draft_candidate records
- any draft pack lacks a validator
- any draft pack validator is missing from master runner
- duplicate master runner labels exist

3. Add this audit script to backend/scripts/run-safescope-full-validation.ts as a validation step near the top after backend build/governance snapshot.

4. Update:
project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md

Add a checkpoint section stating:
- SafeScope AI Transition Gap Map added.
- It inventories current governance systems, draft knowledge packs, validators, and remaining AI transition gaps.
- It adds a repo audit script to prevent draft pack validators from drifting out of the master validation runner.
- It does not add new AI behavior or approved knowledge.
- Advisory-only boundaries remain preserved.

5. Update:
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md

Add a short note that SafeScope now has an end-to-end governance pipeline contract validator that protects against future wiring regressions.

Archive this prompt into:
project-docs/09-archive-reference/prompts/SAFESCOPE_AI_TRANSITION_GAP_MAP_PROMPT.md

Do not commit unless all validation passes.
