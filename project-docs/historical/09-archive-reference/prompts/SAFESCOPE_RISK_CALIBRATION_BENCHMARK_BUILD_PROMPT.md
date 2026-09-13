You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Branch main is synced with origin/main.
- HEAD commit is 2628906 Add SafeScope corrective action specificity expansion.
- Recent completed SafeScope layers:
  - risk reasoning brain
  - risk display/report integration
  - corrective action specificity expansion
  - corrective action risk logic hardening
  - approved source expansion
  - citation evidence-gate hardening
  - canonical pipeline map
- Do not push.
- Do not deploy.

Goal:
Build the SafeScope risk calibration benchmark.

Purpose:
SafeScope now has risk reasoning and risk-informed corrective action logic. The next step is to validate that risk levels, urgency levels, residual risk expectations, and evidence-gap handling are consistent across known safety scenarios.

This benchmark should help prove that SafeScope is not assigning risk randomly or generically.

Requirements:
1. Inspect current risk reasoning and corrective action files before changing anything.
2. Identify files related to:
   - backend/src/safescope-v2/brain/risk-reasoning
   - backend/src/safescope-v2/brain/corrective-action-brain
   - backend/src/safescope-v2/brain/scenario-family-knowledge
   - backend/src/safescope-v2/brain/scenario-intelligence
   - backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts
   - backend/src/safescope-v2/orchestration/contract/pipeline.registry.ts
   - backend/scripts/validate-safescope-field-realism-gauntlet-v3.ts
   - safescope-data/benchmarks
   - project-docs/08-audits
3. Create a risk calibration benchmark dataset or validation script.
4. The benchmark should validate:
   - initialRiskLevel
   - residualRiskLevel
   - urgencyLevel
   - credibleWorstCaseOutcome
   - riskDrivers
   - riskReducers
   - evidenceGaps
   - confidence
   - corrective action urgency alignment
   - guardrails
5. Add calibration scenarios for at least:
   - unguarded conveyor tail pulley during cleanup
   - unguarded conveyor drive while operating
   - energized equipment servicing without lockout context
   - damaged electrical cord in use
   - mobile equipment operating near pedestrians without separation
   - elevated work with missing fall protection detail
   - chemical odor/exposure with missing SDS/PPE/route information
   - blocked emergency exit/egress
   - fire extinguisher inspection tag ambiguity
   - powered door damage/malfunction with employee exposure
   - vague observation with insufficient evidence
   - conflicting observation with control present and absent
6. Expected behavior:
   - clear caught-in/electrical/fall/mobile-equipment scenarios should not be low risk
   - active exposure with missing engineered controls should increase risk/urgency
   - vague observations should produce unknown/moderate risk with evidence gaps
   - conflicting observations should downgrade confidence and trigger review
   - existing controls should reduce residual risk but not erase initial risk
   - blocked emergency access should be elevated when access is plausibly impaired
   - fire extinguisher ambiguity should not overclaim without evidence
7. The benchmark should fail if:
   - critical scenarios are classified low risk
   - vague scenarios are given false certainty
   - residual risk is not separated from initial risk
   - corrective action urgency conflicts with risk level
   - advisory guardrails are missing
   - generic banned corrective action phrases appear
8. Add or update documentation:
   - project-docs/08-audits/SAFESCOPE_RISK_CALIBRATION_BENCHMARK.md
9. Run relevant validations:
   - risk calibration benchmark
   - risk reasoning validation if available
   - corrective action validation if available
   - canonical pipeline validation
   - frontend build only if frontend code is touched
10. Commit locally only with the commit title:
Add SafeScope risk calibration benchmark

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -8
