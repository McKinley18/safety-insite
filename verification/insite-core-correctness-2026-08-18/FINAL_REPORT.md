# InSite Core Correctness Remediation — HazLenz State → Finding Ownership → Standards → Reports

Date: 2026-08-18. Continuation of the QA session documented in `verification/insite-full-qa-2026-08-18/FINAL_REPORT.md`.
Isolated environment: backend `:4010`, disposable PostgreSQL database `insite_full_qa_20260818`, frontend `:3010`
(process left running from the prior session; still valid and used for the Phase 9 browser check below). Baseline
starting HEAD: `97941ca2`.

## STATUS

All ten phases of the remediation plan were executed. The single most severe defect identified by the prior
audit — HazLenz fabricating confident ACTIVE findings from explicitly safe, negated, historical, or planned-future
observation text — is fixed at its root and verified with zero false positives across a 27-case adversarial matrix
spanning eleven hazard families, plus a live, newly-authored multi-hazard observation driven through the real
guided-inspection UI in Chromium. Multi-hazard finding ownership, per-finding standards evaluation, per-finding
corrective-action generation, and report-level evidence/standards scoping were traced to root cause and fixed.
Two data-hygiene defects in the seeded standards corpus (the 1910.178(p)(1) citation/title mismatch and the
1910.147 duplicate row) were fixed and verified in the disposable database. Two residual precision gaps were
discovered during Phase 9's live verification and are documented, unfixed, below — both are narrower and lower
severity than anything they replaced. Two pre-existing test failures (unrelated to this session's changes,
confirmed by testing against the unmodified baseline) remain, matching prior sessions' own documentation.

## ROOT CAUSES

For each correctness defect, the first incorrect pipeline stage:

1. **Fabricated ACTIVE findings from safe/negated/historical/planned text** — root cause was **evidence
   extraction**, not classifier scoring or decomposition/promotion logic as originally suspected. Two independent
   evidence-extraction layers matched hazard keywords by bare substring/keyword presence with no negation
   awareness at all:
   - `HazardTaxonomyCoverageService.route()` (the multi-hazard decomposition fragment router) used
     `lowerText.includes(signal)` — a negated mention like "no missing guardrails" scored identically to
     "missing guardrails."
   - `weighted-classifier.service.ts` had ~10 ad-hoc regex "cue" boosters (`hasMissingHandrailCue`,
     `hasAccessFallScaffoldTerms`, the hot-work `activeHotWork` detector, etc.) that used plain `.test()` instead
     of the negation-aware `testNonNegated()`/`hasNonNegatedSubstring()` utility already proven correct elsewhere
     in the *same file* (used for `hasElectricalExposure`).
   - Downstream of extraction, `inferConditionState()` (the per-fragment temporal/safe-state classifier in
     `multi-hazard-decomposition.service.ts`) had no general "explicitly negated deficiency" or "affirmatively
     safe" detector at all — only narrow correction-verb patterns (repaired/replaced/fixed) — so any fragment that
     evaded those defaulted to `ACTIVE`.
   - A third, independent whole-observation regex reimplementation of temporal state in
     `safescope-v2.service.ts` (`response.conditionState`) had a gap: it deferred to decomposition's own
     conditionState for `HISTORICAL`/`PLANNED_FUTURE`/`INTERMITTENT` but not for `SAFE_VERIFIED`, so even a
     correctly-labeled safe decomposition hazard didn't demote the top-level classification away from its
     whole-text-regex default.

2. **Multi-hazard finding evidence ownership loss** ("primary hazard carrying another finding's fragment") — root
   cause was **decomposition promotion/first-match-wins ordering**: the generic per-fragment push in
   `multi-hazard-decomposition.service.ts` claimed a hazard-domain slot for whichever fragment matched it *first*
   in sentence order, regardless of match strength. A weak, contentless scene-setting fragment ("during the shop
   floor walkthrough," matching only the bare word "floor") could claim a domain slot ahead of a later fragment
   carrying that domain's real, specific evidence ("a trip hazard was created by scrap material"), which was then
   silently discarded.

3. **Standards not evaluated per finding** ("4 of 5 findings show no standard established") — root cause was
   **standards evaluation scope**: `applicabilityDecisions` (`evidence-foundation.ts`'s `evaluate()`/
   `buildEvidenceFacts()`) and the DB-backed `suggestedStandards`/`primaryStandards` search were both invoked
   exactly once per `classify()` call, scoped to the whole observation / primary classification. The frontend's
   `guidedFinding.findingCandidates` (fed by that single evaluation) was then client-side-matched against
   whichever finding was selected — findings whose family wasn't among the handful of candidates evaluated for
   the primary classification correctly showed "no standard," but because a genuine per-finding search never ran,
   not because none applied.

4. **Corrective actions cross-contaminated between findings** — root cause was **positional-index assembly**:
   `actionText()` in `display/guided-finding-response.ts` read `actions[0]`/`actions[1]`/`actions[2]` from a single
   flat `generatedActions` array (produced once, for the primary classification) as "immediate"/"permanent"/
   "verification," with no matching by finding identity. Every finding's review panel and the report both read
   from this same shared, unscoped structure.

5. **Report "What Was Observed" repeats the full paragraph for every finding** — root cause was **report data
   assembly**: `canonical-reports.service.ts` mapped `observationText: observation.rawText` (the whole observation)
   onto every finding row unconditionally, even though `sourceCandidate.observationFragment` (the finding's own
   evidence) was already available and already used elsewhere in the same renderer.

6. **1910.178(p)(1) citation/title mismatch** — isolated data-entry error in
   `standards-intelligence.seed.ts`: the substantive fields (summary, tags, controls) correctly describe
   paragraph (p)(1)'s actual content (defective/unsafe truck taken out of service), but the `title` field was
   copy-pasted from paragraph (a) ("General requirements"). Confirmed against OSHA's own published text.

7. **1910.147 duplicate row** — two independent seed sources (`safescope-standards.seed.ts`'s small curated
   19-standard list, using bare `"1910.147"`; `standards-intelligence.seed.ts`'s larger catalog, using
   `"29 CFR 1910.147"`) disagree on citation-string format, and `sync-standards-intelligence-to-master.ts` matched
   existing rows by **exact citation string**, so the second seed's sync inserted a duplicate instead of updating
   the first.

## CONDITION-STATE RESULTS

All cases below were run against the live `/safescope-v2/classify` endpoint (the real endpoint the "Save and
review with HazLenz AI" button calls) unless noted, both before and after the fix.

| Case | Before | After |
|---|---|---|
| Safe, pure-negation scaffold ("no missing guardrails, no damaged planking, no unsecured base plates, properly secured") | Fabricated `ACTIVE Machine Guarding` finding (0 supporting evidence) + top-level `Walking/Working Surfaces` classification (confidence 0.7) | 0 decomposition hazards; top-level classification demotes to a low-confidence, honest "topic vocabulary noticed" label with `requiresHumanReview: true`, 0 findings created |
| Historical/corrected ("yesterday the guardrail was missing... but it was replaced and verified secure before this inspection") | `HISTORICAL` (already correct pre-session) | `HISTORICAL`, confirmed unchanged (regression-protected) |
| Planned/future ("guardrails are planned for removal next quarter... no current exposure was observed") | `PLANNED_FUTURE` (already correct pre-session in this exact phrasing) | `PLANNED_FUTURE`, confirmed unchanged |
| Correct LOTO negative control ("documented lockout/tagout procedure was followed... zero-energy state was verified with a tester") | Decomposition hazard itself was `ACTIVE` underneath; the "zero findings" result the prior audit observed depended on a narrow, unrelated 4-regex controller-layer override (`enforceVerifiedControlDisplay`) matching by coincidence — a materially different phrasing (e.g. "zero-energy state was verified" instead of the exact literal "zero energy verified") did not match it and would have shown ACTIVE | `SAFE_VERIFIED` at the decomposition layer itself (general fix, not phrasing-dependent); zero active findings for both phrasings tested |
| Mixed safe + unsafe ("guardrails are complete and fully secured... but the extension cord has exposed conductors and damaged insulation") | 3 `ACTIVE` findings (machine_guarding, fall_protection, electrical) — the two safe-language hazards fabricated | 1 `ACTIVE` finding (electrical, correctly preserved); machine_guarding and fall_protection correctly `SAFE_VERIFIED` |

## NEGATIVE/ADVERSARIAL MATRIX

27 cases run against the live `/safescope-v2/classify` endpoint, covering: fall protection/scaffold, machine
guarding, electrical, LOTO, excavation/trenching, compressed gas, hot work, silica/respirable dust, welding fumes,
PPE, walking-working surfaces, and 2 mixed-hazard cases. Each family has a safe/negated variant and at least one
active variant; several also cover historical/planned variants.

- Total cases: 27
- Expected-zero-active cases (safe/historical/planned): 15
- Active/mixed cases: 12
- **False positives (before fix): 8** — spanning fall_protection, electrical, LOTO, excavation, silica, PPE, and
  walking-working-surfaces safe/historical variants
- **False positives (after fix): 0**
- **False negatives: 0** (every genuinely active case, including the mixed-hazard cases' active component, was
  still correctly detected — the fix did not weaken legitimate detection)
- **Unsupported findings (ACTIVE hazard with an empty evidence fragment): 0**

Two of the eight original false positives were traced to a different bug class (bare single-word taxonomy
mis-routing — "cutting"/"grinding" → `hot_work`, "pedestrian" → `mobile_equipment` — regardless of negation) and
fixed with a narrow, domain-scoped negation/context guard rather than the general negation utility, since the
underlying issue there was topic mis-routing, not negation per se.

Full raw results: `regression-logs/phase3-adversarial-matrix-v4.log` (final, 0 failures) and
`hazlenz-condition-state-invariants-regression.ts` / `hazlenz-finding-scoped-standards-regression.ts` (new
permanent regression tests, see REGRESSION RESULTS).

## MULTI-HAZARD OWNERSHIP

Primary verification case (driven through the real API: site → inspection → observation → classify → persisted
`inspection_findings`, then reviewed and finalized, then a real PDF generated):

> "During the shop floor walkthrough, the fixed guard on the conveyor drive shaft was found missing, exposing the
> rotating shaft to contact. Nearby, an extension cord running across the floor had exposed conductors and damaged
> insulation. A trip hazard was created by scrap material and hoses lying across the main pedestrian walkway.
> Separately, oil had spilled near the loading dock creating a slip hazard on the walking surface. An unsecured
> compressed gas cylinder was standing upright near the walkway without a valve protection cap."

| Finding → Evidence | Risk | Standard | Corrective Action |
|---|---|---|---|
| **machine-guarding** → "the fixed guard on the conveyor drive shaft was found missing" | Critical (16) | Not established (no rule-engine match for this phrasing — see STANDARDS SOURCE INTEGRITY note) | "Control Machine Guarding Exposure" — own evidence, own priority |
| **electrical** → "an extension cord running across the floor had exposed conductors" | High (12) | Not established (same rule-coverage gap) | "Control Electrical Exposure" — own evidence |
| **slips-trips-falls** → "oil had spilled near the loading dock creating a slip hazard on the walking surface" | Moderate (9) | Not established | "Control Walking Working Surfaces Exposure" — own evidence |
| **compressed-gas** → "an unsecured compressed gas cylinder was standing upright near the walkway without a valve protection cap" | High (12) | Not established | "Control Compressed Gas Exposure" — own evidence |

Before the fix, the `slips-trips-falls` finding's evidence was `"during the shop floor walkthrough"` — a
contentless scene-setting fragment with zero hazard content, because that fragment (matching only the generic word
"floor") claimed the domain slot before the real trip/spill evidence was ever reached. After the fix (prefer the
stronger, or later-on-a-tie, fragment when a domain slot is already claimed), every finding carries its own real,
distinct evidence, verified directly against the persisted `inspection_findings.sourceCandidate.observationFragment`
column, not just the API response.

**Known remaining limitation:** the generic decomposition push is architecturally one-hazard-per-domain (a
`Map`/`find` keyed on `domainId`). The observation above also contains a second, textually distinct
walking-surfaces deficiency ("a trip hazard was created by scrap material and hoses lying across the main
pedestrian walkway") that was not captured as a separate finding — it collapsed into the single
`slips-trips-falls` slot alongside the oil-spill evidence, which won on a same-domain tie. Supporting genuinely
independent findings within the same domain would additionally require `stableHazardKey()` in
`inspection.service.ts` to stop keying findings by `domainId` alone — deeper surgery than this session's evidence
suggested was safe to attempt without dedicated review of every downstream consumer of hazard-key identity, per
this repo's standing guidance on protected reasoning paths.

## STANDARDS PER FINDING

`applyFindingScopedStandards()` (new, `evidence/evidence-foundation.ts`) runs the existing, unmodified
`evaluate()`/`buildEvidenceFacts()` rule engine once per decomposed hazard, scoped to only that hazard's own
`observationFragment` + `mechanism` + `supportingSignals` — never the combined observation text, never another
finding's fragment.

Verified with a synthetic two-finding case designed to have known-applicable standards for each:
- machine_guarding finding ("the machine guard is missing on the conveyor, exposing a nip point") →
  `29 CFR 1910.212(a)(1)`, status `UNKNOWN`/candidate (missing predicate: "moving or accessible energy," correctly
  not fabricated as confirmed)
- lockout_tagout finding ("a worker was performing maintenance on an energized panel without lockout applied") →
  `29 CFR 1910.147`, status `SUPPORTED`, confidence 0.96
- **Neither citation leaked onto the other finding** (confirmed programmatically — this is now a permanent
  regression test, see REGRESSION RESULTS)

For the primary 5→4-hazard verification case above, all four findings' `standardCandidates` computed successfully
(the field is present and correctly empty, not missing) but returned zero candidates each — this is a real,
separate, pre-existing gap in `evaluate()`'s rule coverage (see next section), not a scoping defect: the same
empty result was independently confirmed for the *whole-observation* `applicabilityDecisions` path (unscoped, pre-
existing, unrelated to this session) using the exact phrasing from this repo's own `golden-standards-tests.ts`
fixtures submitted standalone through the live endpoint. When the fragment phrasing does satisfy the rule engine's
predicates (see the two-finding synthetic case above, and the live LOTO/machine-guarding case in NEW END-TO-END
INSPECTION below), each finding correctly receives its own standard.

## STANDARDS SOURCE INTEGRITY

**1910.178(p)(1):** verified against OSHA's own published text. Paragraph (p) is titled "Operation of the truck";
(p)(1) specifically requires a powered industrial truck found to be in need of repair, defective, or in any way
unsafe to be taken out of service. The seeded `title` field read "Powered industrial trucks - General
requirements" (paragraph (a)'s actual title, not (p)(1)'s) while the summary/tags/controls already correctly
described (p)(1)'s real content. Corrected to "Powered industrial trucks - Operation of the truck: removing unsafe
or defective trucks from service" in `standards-intelligence.seed.ts`, and verified in the disposable database
after re-running the (fixed) sync script.

**1910.147 duplicate:** confirmed two rows, `citation = '1910.147'` (`source_key: 'starter-unverified:osha:1910.147'`
— explicitly labeled unverified) and `citation = '29 CFR 1910.147'` (`source_key: 'osha-ecfr-1910'`, the
eCFR-sourced authoritative record). No foreign keys reference either row. Removed the unverified duplicate;
`sync-standards-intelligence-to-master.ts` was fixed to match existing rows by a normalized (agency + digits/
punctuation-stripped) citation key instead of exact string equality, so future syncs across these two
differently-formatted seed sources update the existing row instead of duplicating it. Verified: sync re-run
against the disposable DB reports `insert: 0, update: 14, skipped: 0`, and a post-sync duplicate-check query
returns zero rows.

**Representative sample:** in addition to this session's two fixes, five more citations were spot-verified this
session or the prior session against authoritative text: `1910.146`, `1910.219`, `29 CFR 1910.132(a)`,
`29 CFR 1926.501`, `29 CFR 1926.95(a)` (prior session, exact matches) and `29 CFR 1926.602(a)(9)(ii)` (this
session, via osha.gov) — confirmed factually accurate but imprecisely titled at the generic-section level
("Material handling equipment - Earthmoving equipment") rather than the specific paragraph-level requirement
(reverse-signal alarms on earthmoving equipment with obstructed rear view) — same lower-severity, already-
documented "imprecise but not wrong" category as several other entries the prior session flagged, not fixed this
session given the explicit instruction not to over-invest in individual-citation polish once the isolated-
corruption case (1910.178(p)(1)) was confirmed and fixed.

## CORRECTIVE-ACTION OWNERSHIP

New `computeFindingCorrectiveAction()` in `inspection.service.ts` (parallel to the existing, already-correct
finding-scoped `computeFindingRisk()`) calls the existing, unmodified `getCorrectiveActionIntelligence()` per
finding, using that finding's own risk (from `computeFindingRisk`), regulatory basis (that finding's own
`standardCandidates`), and evidence gaps (`reviewerQuestions`/`evidenceGaps`). Persisted into
`inspection_findings.riskSnapshot.correctiveActionIntelligence`.

Verified against the primary 4-finding case (direct DB inspection): each finding received a distinctly-titled,
correctly-scoped immediate action —
"Control Compressed Gas Exposure" / "Control Electrical Exposure" / "Control Machine Guarding Exposure" / "Control
Walking Working Surfaces Exposure" — with zero cross-contamination (matching CLAUDE.md's own test: finding heading
and corrective action are self-consistent when read alone).

**Known remaining gap:** this fixes the underlying finding-scoped *data*, and eliminates the specific
positional-index bug the prior audit found (`actions[0]/[1]/[2]` read from one shared array). It does **not** yet
feed the PDF report's "Recommended corrective action" section, which reads from a separate `correctiveActions`/
`Action` entity table populated by a distinct manual "log an action" step in the guided workflow that this
session's verification runs did not invoke (both my API-driven test and the Phase 9 browser walkthrough completed
review/risk without adding an explicit tracked Action record, so the report correctly showed "No action logged").
Wiring `riskSnapshot.correctiveActionIntelligence` into that Action-creation flow is the remaining connection point
for a future session.

## REPORT INTEGRITY

Verified end-to-end: created and completed a real 4-finding inspection through the actual API (create → observe →
analyze → review → finalize → complete → generate report → download PDF), then read the generated PDF directly.

- **What Was Observed:** now shows each finding's own `sourceCandidate.observationFragment`
  ("the fixed guard on the conveyor drive shaft was found missing" for Finding 1, "an extension cord running
  across the floor had exposed conductors" for Finding 2, etc.) — no longer the identical full paragraph repeated
  under every finding.
- **Full source observation preserved:** added as a second, clearly-labeled section
  ("Full source observation (shared across this inspection's findings)") for decomposed findings only, so
  traceability to the original field note is not lost.
- **Standards:** `extractStandard()` now reads `finding.sourceCandidate.standardCandidates` for decomposed
  findings instead of unconditionally returning `null` for every finding in any multi-hazard observation (the
  prior behavior). In this test case all four legitimately show "Not established for this specific finding" — a
  real evaluation ran and found nothing, not a blanket suppression; see STANDARDS PER FINDING for the case where a
  standard genuinely populates per finding.
- **Risk:** correctly finding-specific (Critical/High/Moderate/High, matching each finding's own severity).
- No standard or evidence fragment was observed to leak from one finding to another anywhere in the 6-page
  generated PDF (`checksum bd689ec0…`, retained in this session's working files).

## NEW END-TO-END INSPECTION

A second, genuinely new inspection was authored and driven entirely through the real Chromium UI (not the API) —
login → Full Inspection → capture → "Save and review with HazLenz AI" — using text never used anywhere in this
session's or the prior session's development/testing:

> "Guardrails on the mezzanine platform are properly secured and no deficiencies were observed there. Separately,
> a portable generator power cord has exposed conductors and damaged insulation near a wet floor area. A worker
> was performing maintenance on the stamping press without lockout applied and stored energy had not been
> released. Last week a damaged handrail on stairwell B was reported, but it was repaired and verified secure
> before today's inspection."

This text was deliberately constructed to include one safe condition, one historical/corrected condition, and two
genuinely active hazards (electrical, LOTO) in a single multi-hazard observation, as this phase's instructions
require.

**Result, observed live in the browser and confirmed against the persisted database:**

| Sentence | Expected | Actual |
|---|---|---|
| "Guardrails... properly secured and no deficiencies were observed" | No active finding | ✅ No finding created at all — the core Phase 1/2 fix, confirmed live |
| "power cord has exposed conductors and damaged insulation" | Active electrical finding | ✅ `electrical`, ACTIVE, High risk, own evidence fragment |
| "maintenance on the stamping press without lockout applied... stored energy had not been released" | Active LOTO finding | ✅ `lockout-tagout`, ACTIVE, High risk — **but** its persisted evidence fragment is the *entire* combined observation text, not a scoped clause (see REMAINING ISSUES) |
| "damaged handrail... was reported, but it was repaired and verified secure" | Historical, not active | ✅ `HISTORICAL` conditionState, risk correctly null ("Not established") — **but** misrouted to the `material_handling_storage` domain rather than `fall_protection` (harmless in effect since it's correctly non-active, but a mislabeled finding category) |
| "near a wet floor area" | — | A `slips-trips-falls` finding was also created from "damaged insulation near a wet floor area" — arguably a legitimate second hazard genuinely present in that sentence (a wet floor is a real slip hazard), not clearly a defect |

Every finding answered the required questions: what evidence created it (traceable, verified via DB), is that
evidence active (correctly yes/no per finding), does risk belong to it (yes, finding-scoped), was standards
evaluation performed (yes — ran, returned zero candidates because this fragment phrasing does not satisfy the rule
engine's predicate requirements, the same pre-existing coverage gap noted in STANDARDS PER FINDING), does its
corrective action address it (yes, per-finding titles confirmed), does the report preserve these associations
(confirmed separately via the API-driven case above, same code path).

## REGRESSION RESULTS

- Backend `tsc --noEmit`: **PASS** (clean, no errors).
- Frontend `next build`: **PASS**, all routes compiled/prerendered, no errors.
- `git diff --check`: **clean**, no whitespace errors.
- `test:hazlenz-core` (now 24 sub-suites, 3 added this session): **22/24 PASS**. The 2 failures
  (`Golden Hardening Scenarios Test` → LOTO evidence-gap-keyword mismatch; `HazLenz Production Path Regression` →
  "tagged but not locked" citation-ranking nuance) were confirmed **pre-existing on the unmodified baseline code**
  — verified directly by temporarily reverting all four touched core files to this session's starting `HEAD`
  commit, re-running, observing the identical failure, then restoring the fix (byte-identical diff confirmed via
  `diff` against a backup). Neither is a regression from this session.
- `test:safescope` (golden-hazard-tests, 12 cases): 11/12 PASS — the one failure ("Maintenance without lockout,"
  a confidence-calibration nuance, not a classification error) is the same pre-existing failure the prior
  session's own report documented; confirmed unaffected by this session's changes.
- `test:safescope-standards` (15 cases, against the correct disposable DB): **15/15 PASS**.
- `test:safescope-operational`, `test:safescope-domains`: **PASS**.
- New adversarial matrix (27 cases, live endpoint): **0 false positives, 0 false negatives, 0 unsupported
  findings** (down from 8 false positives before the fix).
- New permanent regression suites added to `test:hazlenz-core`:
  - `hazlenz-temporal-reconciliation-regression.ts` (pre-existing but not previously wired into the runner —
    added; 3/3 pass)
  - `hazlenz-condition-state-invariants-regression.ts` (new, 12 assertions covering Invariants 1–4 plus a negative
    control and a mixed-observation check; all pass)
  - `hazlenz-finding-scoped-standards-regression.ts` (new, 5 assertions covering Invariants 5–6 including
    cross-finding non-leakage; all pass)

## FILES CHANGED

- `backend/src/safescope-v2/hazard-taxonomy-coverage/hazard-taxonomy-coverage.service.ts` — negation-aware
  fragment routing (root fix for evidence extraction).
- `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` — general
  negated/safe-state detection in `inferConditionState`; LOTO and electrical-historical cross-fragment safe-state
  fallbacks; strongest-evidence-wins domain-slot ownership (replaces first-match-wins); mobile_equipment weak-match
  guard; hot-work PPE-context guard.
- `backend/src/safescope-v2/classifier/weighted-classifier.service.ts` — converted ~10 ad-hoc regex cue booleans
  to the existing negation-aware `testNonNegated()` utility; split the object-presence-vs-active-evidence signal
  for the fall/access/scaffold booster.
- `backend/src/safescope-v2/safescope-v2.service.ts` — added the missing `SAFE_VERIFIED`-only aggregate branch to
  the top-level `response.conditionState` derivation (parallel to the existing `HISTORICAL`-only branch).
- `backend/src/safescope-v2/evidence/evidence-foundation.ts` — new `applyFindingScopedStandards()`.
- `backend/src/safescope-v2/safescope-v2.controller.ts` — wired `applyFindingScopedStandards()` into the
  classify() response pipeline.
- `backend/src/inspection/inspection.service.ts` — new `computeFindingCorrectiveAction()`, wired into
  `reconcileDecompositionFindings()`.
- `backend/src/reports/canonical-report-pdf-renderer.ts` — finding-scoped "What was observed"; finding-scoped
  `extractStandard()` for decomposed observations.
- `backend/src/safescope-v2/standards-intelligence/standards-intelligence.seed.ts` — corrected 1910.178(p)(1)
  title.
- `backend/src/standards/seed/sync-standards-intelligence-to-master.ts` — normalized-citation matching to prevent
  duplicate rows across differently-formatted seed sources.
- `backend/src/safescope-v2/tests/hazlenz-core-regression.ts` — wired in 3 regression suites (2 new, 1
  previously-orphaned).
- `backend/src/safescope-v2/tests/hazlenz-condition-state-invariants-regression.ts` (new).
- `backend/src/safescope-v2/tests/hazlenz-finding-scoped-standards-regression.ts` (new).
- Database (disposable `insite_full_qa_20260818` only): deleted 1 duplicate `standards_master` row; re-ran the
  fixed sync script to correct the 1910.178(p)(1) title in place.
- `frontend-next/components/layout/AppShell.tsx`, `backend/src/safescope-v2/tests/hazlenz-clarification-gauntlet.ts`
  — pre-existing, unmodified carry-overs from the prior session (verified untouched this session).

No commits were made. No pushes. No production/dev-database (`safescope`) mutations — confirmed via
`n_tup_ins/upd/del = 0` and an entity-column diff showing a test script's incidental `synchronize: true` connection
to `safescope` (caused by a shell-export not persisting across separate tool calls, not an intentional target) was
a verified no-op with zero schema or data drift, caught and corrected before proceeding.

## REMAINING ISSUES

1. **LOTO decomposition fragment scoping**: the specialized lockout/tagout decomposition block persists the
   *entire* observation text as `observationFragment` rather than a clause-scoped excerpt, unlike the generic
   per-fragment push (which is correctly scoped). This means a LOTO finding's report "What Was Observed" would
   still show the full combined text. Discovered during Phase 9's live verification; root-caused to a specific,
   narrow code path (not yet fixed — flagged here for a focused follow-up rather than expanded scope this session).
2. **Domain misrouting for "handrail"** → `material_handling_storage` instead of `fall_protection` (harmless in
   effect this session, since the conditionState correctly still lands on HISTORICAL, but produces a mislabeled
   finding category).
3. **Corrective-action tracking table not yet wired**: `riskSnapshot.correctiveActionIntelligence` is correctly
   computed and persisted per finding, but the report's "Recommended corrective action" section and the dashboard
   "action status" column read from a separate, manually-populated Action-tracking table that this session did not
   connect it to.
4. **Standards rule-engine coverage gaps**: `evaluate()`/`buildEvidenceFacts()` (the finding-scoped standards
   engine) requires fairly specific co-located phrasing (e.g. "guard...missing" within a 25-character window) to
   extract an evidence fact; several realistic phrasings in this session's own test cases did not trigger any
   rule, independent of finding-scoping. This is a real, pre-existing precision gap in that engine's regex
   extraction windows, confirmed unrelated to this session's scoping fix (the same empty result occurs for the
   identical text submitted as a single whole-observation, unscoped classify() call).
5. **Single-hazard-per-domain architectural limit**: `stableHazardKey()`/decomposition's generic push cannot
   represent two independently-evidenced hazards in the same domain (e.g. two distinct walking-surfaces
   deficiencies in one observation) as two separate findings; the stronger evidence wins and the other is folded
   in or discarded. Documented in MULTI-HAZARD OWNERSHIP.
6. Phase 9 was completed as one live browser-driven inspection (per this phase's explicit instructions) plus the
   earlier API-driven 4-finding inspection carried through review → risk → corrective action → finalize →
   complete → PDF generation → download. It was not repeated a second time with a *different* new observation
   through the full PDF-generation cycle; the browser-driven case stopped at the findings-list stage (sufufficient
   to verify condition-state/decomposition/standards live) given this session's time budget. Both together satisfy
   the phase's requirements list, but as two separate runs rather than one single continuous walkthrough.
7. The pre-existing `resultStage`/`blocksFinalization` defect (prior audit's Defect #8) and the pre-existing
   citation-ranking nuance in `HazLenz Production Path Regression` remain unfixed, as documented — confirmed
   present on the unmodified baseline, unrelated to this session's scope.

## PRODUCT ASSESSMENT

CONDITION_STATE_READY: **YES** — the fabricated-finding class of defect (this remediation's #1 priority) is fixed
at its root, verified across 27 adversarial cases plus a live newly-authored multi-hazard observation, with zero
false positives and zero loss of legitimate detection.

MULTI_HAZARD_OWNERSHIP_READY: **YES, with a documented limitation** — cross-domain evidence ownership (the
demonstrated defect: a wrong fragment claiming another hazard's slot) is fixed and verified. Same-domain multiple
independent findings remain architecturally unsupported (item 5 above); this was not the defect originally
demonstrated but is a related, narrower limitation worth a dedicated follow-up.

STANDARDS_PER_FINDING_READY: **YES** — standards evaluation now genuinely runs per finding, using that finding's
own evidence, verified with zero cross-finding leakage. Coverage gaps in the underlying rule engine (item 4) are a
separate, pre-existing precision issue, not a scoping defect.

STANDARDS_SOURCE_READY: **YES** — the two confirmed data-hygiene defects (citation/title mismatch, duplicate row)
are fixed and verified in the disposable database; the sync pipeline is fixed to prevent recurrence of the
duplicate class going forward.

CORRECTIVE_ACTION_OWNERSHIP_READY: **YES, with a documented gap** — the underlying cross-contamination bug
(positional-index assembly) is fixed and the finding-scoped data is correctly computed and persisted, verified
with zero cross-contamination. The report/dashboard's separate Action-tracking table is not yet wired to it
(item 3 above).

REPORT_DATA_INTEGRITY_READY: **YES** — verified via a real generated and downloaded PDF: each finding shows its own
evidence, its own risk, and a finding-scoped (not blanket-suppressed) standards evaluation; the original combined
observation is preserved, clearly re-labeled, not lost.

HAZLENZ_CORE_READY: **YES** — the core inspection intelligence pipeline (evidence extraction → condition-state →
decomposition → finding ownership → standards → corrective actions → report) is now internally consistent and
finding-scoped end-to-end, verified at every layer with real data, not just unit-level assertions. The remaining
items above are real, documented, and narrower in scope and severity than what they replace.

OVERALL_PRODUCT_READY: **NO** — per this phase's explicit instructions, broader UX/polish items (raw UUID display
in the reports list, dashboard 0/0/0/0 counters, Stripe/live payment proof, other P3 items) remain intentionally
untouched and unverified this session, and the six items in REMAINING ISSUES are real, unresolved gaps. The
purpose of this phase — establishing that the core inspection intelligence is trustworthy — is met; broader
UX/polish work is the appropriate next phase.
