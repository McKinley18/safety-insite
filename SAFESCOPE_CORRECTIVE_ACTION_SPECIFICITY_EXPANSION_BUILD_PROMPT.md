You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- HEAD commit is a087f39 Harden SafeScope citation evidence gates.
- Branch main is ahead of origin/main by 2 local commits.
- Recent completed SafeScope layers:
  - approved source population expansion
  - citation evidence-gate hardening
  - risk reasoning brain
  - risk display/report integration
  - canonical pipeline map
  - corrective action reasoning brain
  - scenario-family knowledge registry
  - standard-family candidate mapper
  - citation-level candidate review
- Do not push.
- Do not deploy.

Goal:
Build the SafeScope corrective action specificity expansion.

Purpose:
SafeScope can now identify hazards, assess risk, map standard/citation review candidates, and enforce citation evidence gates. The next step is to improve corrective action quality so recommendations are scenario-specific, field-realistic, risk-informed, and tied to verification evidence.

The goal is to reduce generic recommendations and make SafeScope feel more like a professional safety expert.

Requirements:
1. Inspect the current SafeScope corrective action architecture before changing anything.
2. Identify files related to:
   - backend/src/safescope-v2/brain/corrective-action-brain
   - backend/src/safescope-v2/corrective-actions
   - backend/src/safescope-v2/brain/risk-reasoning
   - backend/src/safescope-v2/brain/scenario-family-knowledge
   - backend/src/safescope-v2/brain/scenario-intelligence
   - backend/src/safescope-v2/brain/evidence-gap-question-generator
   - backend/src/safescope-v2/brain/citation-review-brain
   - backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts
   - backend/src/safescope-v2/orchestration/contract/pipeline.registry.ts
   - backend/src/safescope-v2/types/safescope-intelligence.types.ts
   - frontend-next/lib/safescope/adapters/intelligence-display.adapter.ts
   - frontend-next/components/safescope/panels/IntelligencePanel.tsx
   - frontend-next/lib/safescope/export/narrative-export.bridge.ts
3. Expand corrective action reasoning so outputs account for:
   - equipment involved
   - task being performed
   - mechanism of injury
   - employee exposure
   - operational state
   - energy source
   - missing or failed control
   - existing controls
   - initial risk level
   - residual risk level
   - urgency level
   - evidence gaps
   - citation/standard review candidates
   - verification requirements
4. Corrective action output should clearly separate:
   - immediate action
   - interim control
   - permanent corrective action
   - engineering control recommendation
   - administrative follow-up
   - training/communication need
   - verification evidence required
   - responsible role suggestion
   - suggested due-date logic
   - residual risk expectation
   - human review triggers
   - advisory guardrails
5. Add scenario-specific corrective action expansion for at least:
   - conveyor cleanup near moving parts
   - unguarded conveyor pulley or drive
   - powered door damage/malfunction with employee exposure
   - fire extinguisher inspection / label / access ambiguity
   - energized equipment servicing without clear lockout context
   - mobile equipment operating near pedestrians
   - elevated work with possible fall exposure
   - chemical exposure with unclear route or missing SDS/PPE/ventilation context
   - electrical exposure from damaged cords, panels, or energized parts
   - blocked emergency access or egress
6. Corrective actions should avoid vague phrases such as:
   - “be careful”
   - “follow safety rules”
   - “train employees” without specifying what training or verification is needed
   - “fix the issue” without specifying the control or verification requirement
7. Corrective action reasoning should be risk-informed:
   - critical/immediate risk should trigger immediate isolation or stop-use style recommendations where appropriate
   - high/serious risk should trigger urgent corrective action and interim controls
   - moderate/low risk should still define verification and follow-up
   - unknown risk should request evidence before final prioritization
8. Preserve existing output compatibility where possible.
9. Wire expanded corrective actions into:
   - intelligence orchestrator output
   - intelligence output contract/types if needed
   - report-ready narrative generator if appropriate
   - report narrative export bridge if safe
   - frontend display adapter/panels if safe and minimal
10. Preserve all advisory guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
11. Corrective action reasoning must never:
   - declare a violation
   - issue or simulate a citation
   - override qualified professional judgment
   - hide missing evidence
   - recommend unsafe work continuation where immediate exposure is plausible
   - present advisory corrective actions as final required legal determinations
12. Add or update validation scripts to prove:
   - corrective actions are scenario-specific
   - high/critical risk produces urgent/immediate action logic
   - vague observations produce evidence gaps rather than over-specific actions
   - actions include verification evidence requirements
   - actions include immediate/interim/permanent separation where appropriate
   - generic banned phrases are not used
   - guardrails are preserved
   - risk reasoning integration remains intact
   - citation evidence gates remain intact
   - canonical pipeline validation still passes
13. Run relevant validations:
   - corrective action validation
   - risk reasoning validation if available
   - citation review validation
   - canonical pipeline validation
   - frontend build only if frontend code is touched
14. Commit locally only with the commit title:
Expand SafeScope corrective action specificity

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -8
