# V5 Midpoint Audit — Phase 4: Evidence-Sufficiency Calibration Audit

Verification scripts (pure in-memory, no DB, disposable):
`verification/hazlenz-v5-midpoint-audit-2026-08-16/scripts/evidence-sufficiency-corpus.ts`
`verification/hazlenz-v5-midpoint-audit-2026-08-16/scripts/finding-scoped-feasibility-trace.ts`
(run via `npx ts-node` from `backend/`).

## Corpus results

`EvidenceSufficiencyService.evaluateEvidenceSufficiency()` run directly (text-only path,
`observationUnderstanding`/`causalRiskReasoning` = `{}`, matching C03's own "conservative floor" probe
methodology) against a 13-category corpus, with `buildEvidenceFacts()`-derived `sharedFacts`:

| # | Category | Score | Tier | Notes |
|---|---|---|---|---|
| 1 | Clear hazard / strong evidence | 0.39 | weak | Reproduces C03's documented 0.39 exactly |
| 2 | Vague safety concern | 0.29 | insufficient | Reproduces C03's documented 0.29 exactly |
| 3 | Effective control | 0.38 | weak | Blocked today only by a separate hardcoded allowlist, not by sufficiency |
| 4 | Failed control | 0.39 | weak | Correctly finalizes |
| 5 | Ambiguous condition | 0.29 | insufficient | Correctly gated |
| 6 | Unknown control status | 0.44 | weak | **Not caught by the gate at all** — see coverage gap below |
| 7 | Negated hazard | 0.38 | weak | Blocked by an unrelated pre-existing mechanism |
| 8 | Historical resolved | 0.34 | insufficient | Conflation finding — see below |
| 9 | Planned future correction | 0.29 | insufficient | Same conflation |
| 10 | Multi-hazard (2 clear) | 0.54 | weak | Confirms C03's multi-hazard claim |
| 11 | Standards-only uncertainty | 0.39 | weak | No dimension models this at all |
| 12 | Jurisdiction-only uncertainty | 0.43 | weak | `jurisdictionClarity` falsely inflated to 0.65 — see defect below |
| 13 | Optional enrichment | 0.41 | weak | `evidenceSupport` falsely inflated to 0.85 — see defect below |

## Confirmed defects

### 1. Negation-blind keyword scoring (previously undocumented)

Several of the 9 scorers' text-fallback branches use plain `includesAny()` substring checks with no
negation awareness: `evidence-sufficiency.service.ts:414-448` (`scoreEvidenceSupport`), `:385-412`
(`scoreJurisdictionClarity`), and similarly in the fallback branches of `scoreEquipmentClarity`,
`scoreTaskClarity`, `scoreEnergyClarity`, `scoreControlFailureClarity`.

Case 13's text *"No photos or measurements were taken during the observation"* scored
`evidenceSupport: 0.85` — the negated clause still matched `includesAny(text, ['photo', ..., 'test'])`.
Case 12's *"unclear whether this site is subject to MSHA or OSHA"* scored `jurisdictionClarity: 0.65` for
the same reason.

This is a **known-and-already-fixed defect class elsewhere in the same codebase**: `shared-evidence-
facts.ts:208-214` already imports `hasAnyNonNegatedTerm` to correct exactly this failure mode for one
fact type. The fix was never ported to `EvidenceSufficiencyService`'s own heuristics.

Impact: did not flip a tier in this 13-case corpus, but case 13's corrected score would land near ~0.354
— close enough to the 0.35 tier boundary that this plausibly flips a real case from `weak` to
`insufficient` (false-insufficient) or vice versa depending on exact wording. This is a real,
previously-undocumented calibration risk distinct from the already-known false-insufficient finding from
C03.

### 2. "Insufficient" tier conflates vagueness with resolved/planned state

Cases 8–9 (historical-resolved, planned-future) score in the bottom `insufficient` tier despite
`buildEvidenceFacts` correctly extracting high-confidence, unambiguous facts (`currentHazardState=
"not_established"`, status `corrected`; `guardState="absent_or_ineffective"`). The correct blocking
behavior for these cases today comes from an entirely separate mechanism (C02's temporal semantics
upstream), so `resultStage` ends up right by coincidence of a different gate — but if the C03 gate's
`reason` string were ever surfaced to a user as an explanation, it would misleadingly claim "insufficient
evidence" for a case that is actually well-evidenced and merely temporally resolved.

### 3. Narrow gate does not generalize "unknown critical fact"

Case 6 (`"A worker was servicing the conveyor drive"`, energy state unstated) scores `weak (0.44)`,
never entering `insufficient`. Blocking on this class of case depends entirely on a pre-existing
hardcoded 5-ID `safetyDecisiveIds` allowlist (`machine-energy-state`, `machine-controls`, etc.) — which
the C03 reason-classification doc itself already flags as `DEFECTIVE_RULE (narrow scope)`. This corpus
concretely confirms the practical consequence: any hazard family outside those 5 IDs with an analogous
single missing safety-decisive fact (e.g., unverified respiratory-protection fit, unconfirmed fall-arrest
anchor) scores `weak` and finalizes as `final`/`mayFinalize: true` today, uncaught by either mechanism.

## Answers to the audit questions

- **False-insufficient rate (this corpus):** 0/13 — no well-evidenced active hazard was wrongly blocked
  by the C03 gate specifically; the C03 fix holds under this expanded corpus.
- **False-sufficient rate:** Not observed as a `resultStage` flip in this corpus, but two concrete
  scoring-composition defects (cases 12, 13) demonstrably push scores in the wrong direction, and one
  architectural coverage gap (case 6) means the gate provides zero protection for "unknown critical fact"
  hazards outside 5 hardcoded IDs.
- **Is the narrow C03 gate defensible?** Yes, for its stated narrow purpose (catching near-total absence
  of hazard signal) — it causes no new regressions in this corpus. It is **not** a general
  evidence-sufficiency safety net, and should not be treated or marketed as one.
- **Is score composition conceptually flawed?** Yes, in two ways: (1) an unweighted 9-dimension average
  conflates "does a hazard exist" dimensions with "is the narrative refined" dimensions, discarding
  sub-dimension granularity that matters for blocking decisions; (2) several fallback heuristics are
  negation-blind, a defect class already known and fixed elsewhere in this codebase but never ported
  here.
- **Does calibration itself deserve a future phase?** Yes — see backlog. Recommended as MEDIUM priority,
  sequenced before or alongside any Option B/C frontend consumption of the finalization signal (per
  `V5_MIDPOINT_FINALIZATION_SIGNAL_AUDIT.md`).

No thresholds were modified during this audit, per operating constraints.
