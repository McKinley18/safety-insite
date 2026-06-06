You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- HEAD commit is 82ac212 Add SafeScope architecture maturity audit.
- Branch main is ahead of origin/main by 3 local commits.
- Recent audit documents:
  - SAFESCOPE_AI_READINESS_MANIFEST.md
  - SAFESCOPE_CURRENT_ARCHITECTURE_PRODUCT_MATURITY_AUDIT.md
- Do not push.
- Do not deploy.

Goal:
Build the SafeScope canonical pipeline map and orchestration consolidation layer.

Purpose:
SafeScope now has many AI-style reasoning brains and output layers. The next step is to define and enforce one canonical pipeline sequence so each SafeScope run follows a predictable, auditable, maintainable path.

This should reduce duplication, clarify which systems are active versus supporting/experimental, and make future builds such as risk reasoning, citation hardening, source expansion, and UI polishing safer.

Requirements:
1. Inspect the current SafeScope v2 structure before changing anything.
2. Identify the current pipeline participants, including:
   - normalized observation context
   - observation understanding
   - semantic routing
   - semantic conflict handling
   - scenario intelligence
   - scenario-family knowledge
   - standard-family candidate mapper
   - citation-level candidate review
   - approved source governance
   - corrective action reasoning
   - evidence-gap question generation
   - risk/confidence systems
   - report-ready narrative generator
   - reviewer feedback trace
   - intelligence output contract
   - frontend adapter/panels
3. Create a canonical pipeline map model and document.
4. If appropriate, create a lightweight backend pipeline registry/type file that defines:
   - pipelineVersion
   - stageId
   - stageName
   - stagePurpose
   - requiredInputs
   - producedOutputs
   - guardrails
   - active/supporting/experimental status
   - downstreamConsumers
5. Do not do a large runtime rewrite unless clearly safe.
6. Prefer documentation + typed registry + validation over risky refactoring.
7. Add or update an audit document at:
   - project-docs/08-audits/SAFESCOPE_CANONICAL_PIPELINE_ORCHESTRATION_MAP.md
8. The document must explain:
   - official SafeScope pipeline order
   - active runtime stages
   - supporting intelligence stages
   - experimental or stale areas
   - which frontend/reporting pieces consume the pipeline output
   - how future risk reasoning should plug in
   - how future approved-source expansion should plug in
   - how future reviewer feedback UI should plug in
9. Add a validation script if appropriate, such as:
   - backend/scripts/validate-safescope-canonical-pipeline-map.ts
   The validation should confirm required stage names and guardrails are present.
10. Preserve all advisory guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
11. Do not weaken or remove existing SafeScope output fields.
12. Do not modify frontend UI in this step unless required for type compatibility.
13. Run relevant validations:
   - pipeline map validation if added
   - frontend build only if frontend code is touched
   - backend validation only if backend runtime code is touched
14. Commit locally only with the commit title:
Add SafeScope canonical pipeline map

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -8
