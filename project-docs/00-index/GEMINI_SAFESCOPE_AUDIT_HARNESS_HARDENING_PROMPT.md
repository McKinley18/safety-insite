# Gemini Task: Harden SafeScope Finding Audit Harness

You are working in the active Sentinel Safety repository:

/Users/mckinley/Sentinel_Safety

The current SafeScope finding audit harness exists but is still too shallow. It runs real SafeScope reasoning through:

backend/scripts/audit-safescope-findings.ts

Benchmark data:

safescope-data/benchmarks/safescope-finding-audit.v1.json

Generated JSON results:

safescope-data/benchmarks/safescope-finding-audit-results.v1.json

Generated markdown report:

project-docs/08-audits/SAFESCOPE_FINDING_AUDIT_RESULTS.md

Current observed results:
- Total cases: 4
- Pass: 2
- Review: 2
- Average score: 0.50

Known findings:
1. Conveyor guarding passed.
2. Electrical exposed wiring passed.
3. Trenching likely failed because of a taxonomy alias mismatch:
   expected `trenching_and_excavation`, actual `excavation_trenching`.
4. Coal underground roof-control failed more seriously:
   expected `roof_control`, actual `walking_working_surfaces`.
5. Corrective actions are often too generic and need more targeted scoring.

## Goal

Harden the SafeScope audit harness into a meaningful evaluation system that measures whether SafeScope is accurate, appropriate, and field-useful.

## Required Work

### 1. Improve benchmark schema support

Update the audit harness so each benchmark can include:

- expected.hazardFamily
- expected.acceptableHazardFamilies
- expected.hazardMechanism
- expected.acceptableMechanisms
- expected.equipment
- expected.acceptableEquipment
- expected.primaryCitation
- expected.acceptableCitations
- expected.requiresCorrectiveAction
- expected.requiresShutdownOrImmediateControl
- expected.minimumCorrectiveActionElements
- expected.contextMustInfluenceResult

Do not break the current benchmark file. Add backward-compatible handling.

### 2. Add taxonomy alias matching

The evaluator should treat known aliases as equivalent. At minimum:

- `trenching_and_excavation` equals `excavation_trenching`
- `machine_guarding` equals `guarding`
- `electrical` equals `electrical_safety`
- `roof_control` equals `ground_control` only when context is coal underground or underground mining

Implement this as a small explicit alias map inside the audit script or as a benchmark-level acceptableHazardFamilies list.

### 3. Improve scoring

Replace the current simple score with a weighted score:

- Hazard family: 25 points
- Hazard mechanism: 15 points
- Equipment/context recognition: 10 points
- Citation/scope fit: 20 points
- Corrective action appropriateness: 20 points
- Confidence appropriateness: 5 points
- Immediate control/shutdown recognition: 5 points

Total possible score: 100.

Result bands:
- pass: score >= 85
- review: score >= 65 and < 85
- fail: score < 65

### 4. Corrective action scoring

Score corrective actions by checking whether SafeScope's returned corrective actions contain enough hazard-specific elements.

Use expected.minimumCorrectiveActionElements as the scoring baseline.

Examples:
- Conveyor guarding should mention guard/guarding, nip point/contact prevention, verification before operation.
- Trenching should mention protective system, shoring/sloping/shielding, competent person or egress if expected.
- Coal roof-control should mention barricade/restrict access, loose rock/scaling, supplemental support/roof control.
- Electrical should mention de-energize or restrict energized exposure, install cover/enclosure, verify condition.

Partial credit is acceptable.

### 5. Confidence scoring

Do not simply reward high confidence. Confidence should be appropriate.

Rules:
- Correct classification + correct citation + action quality good: high confidence is appropriate.
- Missing citation, generic action, or weak context: high confidence should be penalized.
- If SafeScope returns high confidence on the wrong hazard family, record this as a critical review note.

### 6. Report quality

Update SAFESCOPE_FINDING_AUDIT_RESULTS.md to include:

- Total cases
- Pass/review/fail counts
- Average weighted score
- Lowest scoring cases
- Findings requiring SafeScope engine improvement
- Findings that are only benchmark/scoring alias problems
- Detailed table with:
  - ID
  - title
  - expected family
  - actual family
  - expected citation
  - actual citation if available
  - confidence
  - corrective action score
  - total score
  - result
  - notes

Also write full detailed results to:

safescope-data/benchmarks/safescope-finding-audit-results.v1.json

### 7. Do not make SafeScope engine changes yet

For this task, only harden the audit harness, benchmark data, and reporting. Do not change SafeScope reasoning logic yet. We need a reliable measurement system before improving the engine.

### 8. Add or update package script

Add or confirm a backend package script:

"audit:safescope-findings": "ts-node scripts/audit-safescope-findings.ts"

It should be runnable from:

cd ~/Sentinel_Safety/backend
npm run audit:safescope-findings

Also make sure the root invocation still works if possible:

cd ~/Sentinel_Safety
npx ts-node backend/scripts/audit-safescope-findings.ts

### 9. Validate

Run:

cd ~/Sentinel_Safety
npx ts-node backend/scripts/audit-safescope-findings.ts
./scripts/verify-production-readiness.sh
git status --short

### 10. Final response

Report:
- What files changed
- Whether the audit ran successfully
- The new pass/review/fail counts
- The new average score
- The top SafeScope weaknesses revealed
- Whether changes were committed or left uncommitted

Do not push. Do not deploy. Do not delete unrelated files.
