# InSite Core Closure — Standards Validation + Inspection Regulatory Context + HazLenz Autonomy

Date: 2026-08-18. Continuation of the 19-phase core-closure/standards-validation task (Phases 1–12 were
completed in the earlier checkpoints of this task and are recorded in `JURISDICTION_GATE_DEFECT.md`,
`CORPUS_INTEGRITY_AUDIT.md`, `STANDARDS_ACCURACY_CONTRACT.md`; the predecessor remediation is
`verification/insite-core-correctness-2026-08-18/FINAL_REPORT.md`).

Environment (unchanged, not torn down): backend `:4010` (ts-node, restarted after each backend change), frontend
`:3010` (`next dev`, hot reload), disposable PostgreSQL `insite_full_qa_20260818` (migration applied there only —
the original `safescope` database was verified untouched: 0 `regulatoryContext` columns, last migration unchanged),
baseline `97941ca2`, all remediation uncommitted in the working tree. Disposable QA user
`riley.okafor.qa4@insite-verify.test` (created this session; Pro entitlement grant inserted in the disposable DB).

Evidence directories written this session: `harness/` (live-endpoint D/E/F–J results + case sets + scripts),
`phase16-reports/` (three generated PDFs + text), `standards-gold-set/gold-set-script-v2.ts`,
`LEARNING_ARCHITECTURE.md`, `KNOWLEDGE_FRESHNESS.md`, `CONSTRUCTION_RULE_SOURCES.md`, `regression-logs/`.

---

## STATUS

All remaining phases (13–19) and the new sections A–Q were executed. The product decision — establish regulatory
context ONCE per inspection and inherit it everywhere, while HazLenz analyses first and asks only when a missing
fact could change the conclusion — is implemented end to end (data model → API → HazLenz evidence/standards
engine → persistence → Standard Detail UI → PDF report), verified at the API level, by permanent regression, and by
three complete new inspections driven through the real Chromium UI (Construction, General Industry, MSHA), each
with a HazLenz-narrative finding and a manually-entered finding statement, each carried through review →
finalize → corrective action → completion → PDF.

---

## INSPECTION REGULATORY CONTEXT

**Setup UX.** `/inspections` (the canonical start page) gained one field, "Regulatory context", with exactly the
four choices *OSHA — General Industry · 29 CFR 1910*, *OSHA — Construction · 29 CFR 1926*, *MSHA · 30 CFR*,
*Not sure / Let HazLenz determine*. It defaults from the existing Settings default (`sentinel_regulatory_scope`)
so a single-regime user never touches it, and is sent with `POST /inspections`. No questionnaire; one select.
The workspace header shows "Regulatory context: **X** — set for this inspection; every finding inherits it"
(or, for unknown, "HazLenz keeps standards conditional and will ask once if the agency matters"), and the
capture step's old page-local "Site context" select was replaced by the same persisted control (changing it
PATCHes the inspection).

**Persistence.** New column `inspection.regulatoryContext` (varchar 32, default `'unknown'`; migration
`1800000009000-InspectionRegulatoryContext.ts`, applied to the disposable DB only), `CreateInspectionDto`/
`UpdateInspectionDto.regulatoryContext` validated against the same enum HazLenz's evidence model already uses
(`msha | osha-general-industry | osha-construction | unknown` — no second competing model). Optimistic-version
guarded (stale PATCH → 409, verified), audit event `inspection_regulatory_context_set` on create/change with
previous value and provenance (verified in `security_audit_events`). Survives observation creation, finding
decomposition, reload/navigation (verified in Chromium: navigating away and back restored the context line and
the finding-scoped panel), finalization and report generation (context row in every PDF).

**Provenance.** Reuses the existing `EvidenceFact` representation: `source: 'inspection_context'` /
`status: 'confirmed'` = USER_CONFIRMED; `source: 'system_inference'` / `status: 'inferred'` = HAZLENZ_INFERRED;
`status: 'unknown'` = UNKNOWN. Every classify response now carries
`regulatoryContext { value, provenance, source (inspection | request | observation_evidence), basis[] }`, every
applicability decision and every persisted per-finding candidate carries `jurisdictionProvenance`, and the
inspection-level provenance is derived (`regulatoryContextProvenance()`): a non-unknown persisted value can only
have come from the user. HazLenz inference is never written to the inspection; it stays per-analysis and labelled.

**Propagation (traced and verified).** Inspection (`regulatoryContext`) → workspace sends `inspectionId` on
every classify → `SafescopeV2Controller.applyInspectionRegulatoryContext()` loads the persisted inspection
(authorization-checked via `InspectionService.findAccessible`) and overrides BOTH jurisdiction vocabularies
(`structuredObservation.jurisdiction` for the evidence engine, `scopes` for the classifier's standards search)
regardless of what the client sent → `buildEvidenceFacts()` resolves the ONE jurisdiction (inspection context >
explicit request > answered clarification > inference from strong wording > unknown) → `evaluate()` narrows to that
regime → `applyFindingScopedStandards()` forwards the observation-wide jurisdiction *with provenance* to every
finding → `standardCandidates` (each with `jurisdictionProvenance`) persisted on `inspection_findings.sourceCandidate`
→ Standard Detail panel reads the selected finding's own candidates → `computeFindingCorrectiveAction()` uses that
finding's direct candidates as regulatory basis → PDF prints the inspection context row and each finding's own
standard (with an explicit "Jurisdiction inferred by HazLenz (not user-confirmed)" prefix when applicable).
Regression invariant 2 exercises the controller override with a stubbed inspection and confirms every decomposed
finding inherits USER_CONFIRMED context with zero cross-regime leakage. A client without `inspectionId` cannot
claim inspection-level provenance (folded into an ordinary request jurisdiction; invariant 2d).

**Behaviour by context** (`harness/D_JURISDICTION_MATRIX.md`, 36 live cases = 9 findings × 4 contexts):

| Context | Result |
|---|---|
| **General Industry** | 1910.28 (roof edge and scaffold open side), 1910.147, 1910.212(a)(1), 1910.95, 1910.36, 1910.1200, 1910.303 SUPPORTED, zero questions; no 1926/30 CFR anywhere. Excavation: no GI rule (honest empty; the service layer's generic follow-ups remain — see remaining issues). |
| **Construction** | 1926.501, 1926.451(g)(1)+1926.501, 1926.652(a)(1), and — newly added after verifying the text on osha.gov (`CONSTRUCTION_RULE_SOURCES.md`) — 1926.59, 1926.52, 1926.416(a)(1), 1926.300(b)(2) SUPPORTED, zero questions; no 1910 substitution. Construction LOTO and egress have no 1926 rule yet (documented gap). |
| **MSHA** | 56.15005, 56.12016, 56.14107(a) SUPPORTED; no 29 CFR returned as governing anywhere; 56.12025 (exposed energized cord) is an honest candidate asking one conductive-pathway question (previously mis-reported CONTRADICTED — fixed). |
| **Unknown** | Every case retains candidates across regimes as `UNKNOWN`/conditional (no zero-candidate failure, no SUPPORTED regime match), and asks exactly ONE consolidated question `jurisdiction` ("Which regulatory authority governs this inspection site?" — options OSHA General Industry / OSHA Construction / MSHA / Not sure, `scope: inspection`), which replaced the previous three separate "Can you confirm: X jurisdiction?" yes/no questions. Answering it resolves the regime (USER_CONFIRMED) and the workspace persists the answer to the inspection so it is never asked again. When the observation's own wording strongly establishes a single regime (`surface mine`/`miner`, `construction site`/`roofer`, `warehouse`…), HazLenz infers it (HAZLENZ_INFERRED, confidence capped at 0.8/"Moderate", basis phrases shown, "Confirm for this inspection" button in the UI); conflicting cues do not infer. |

---

## DIRECT FINDING STANDARDS (Section E)

The canonical workspace has no separate "manual finding" form: the observation textarea *is* where a user types a
finding, and HazLenz decomposition + finding-scoped standards run on whatever is typed. Verified live
(`harness/E_MANUAL_FINDINGS.md`) — Manual finding → HazLenz interpretation → standard evaluation → result:

| Manual finding (as typed) | Finding | Standard (finding-scoped) | Result |
|---|---|---|---|
| Employee servicing equipment without energy isolation. | lockout_tagout | 29 CFR 1910.147 direct | SUPPORTED, no questions |
| Employee is servicing the packaging line without isolating hazardous energy; the line is still powered. | lockout_tagout | 1910.147 direct | SUPPORTED, no questions |
| Unguarded machine point of operation. | machine_guarding | 1910.212(a)(1) candidate | one confidence-improving question (moving/accessible energy) |
| The point of operation on the punch press is unguarded and the operator's hands enter the die area while it is running. | machine_guarding | 1910.212(a)(1) direct | SUPPORTED, no questions |
| Scaffold open-side fall exposure. (Construction) | fall_protection | 1926.451(g)(1), 1926.501 candidates | three predicate questions (height / worker on platform / exposure) — appropriate for a terse statement |
| A worker is on a scaffold platform about 12 feet above the ground with an open side that has no guardrail or personal fall arrest system. | fall_protection | 1926.451(g)(1) + 1926.501 direct | SUPPORTED, no questions |
| Damaged electrical cord. | electrical | none | 3 questions (see remaining issues: two are off-target panel questions) |
| An extension cord in use at the workbench has damaged insulation with exposed copper conductors and is still plugged in. | electrical | 1910.303 direct | SUPPORTED, no questions |
| Excessive occupational noise. | noise (no candidate) | none | honest "evidence insufficient" question |
| Employees in the grinding area are exposed to a measured 92 dBA 8-hour TWA with no hearing conservation program. | noise_exposure | 1910.95 direct | SUPPORTED, no questions |

Before this session, three of the five natural-language manual findings produced no finding or no standard
(the LOTO "without energy isolation"/"no lock or tag applied" wording, "exposed copper conductors", "92 dBA 8-hour
TWA" and "no guardrail" were not recognised; "grinding area" spawned a spurious hot-work finding). Those were
extraction-recall defects on ordinary phrasing (fixed, see below), not scoping defects. Regression invariant 11
pins all five natural forms. In the three Chromium inspections the "Manual finding: …" sentence produced its own
finding with its own standard (1926.416(a)(1) / 1910.303 / 30 CFR 56.12016) and its own corrective action.

---

## HAZLENZ AUTONOMY (Sections F–J)

Live audit set (`harness/F_AUTONOMY_AUDIT.md`, `harness/harness-results.json`): 19 observations, 20 findings.

| Metric | Value |
|---|---|
| Observations tested | 19 (12 clear/high-evidence incl. the LOTO/guarding/construction-fall/electrical/silica/exit/hazcom/trench/MSHA-guard/noise/inferred-MSHA cases and the safe+active multi-hazard case; 7 genuinely ambiguous) |
| Findings generated | 20 |
| Clarification questions (total) | 13 |
| Engine-flagged "blocking" (`blocksFinalization`) | 3 (all in ambiguous cases) — note: nothing blocks the persisted workflow, see HUMAN REVIEW BEHAVIOUR |
| Optional | 10 |
| DECISION_CRITICAL | 6 (jurisdiction unknown with no cues; servicing with no energy-control facts; trench with unknown exposure/protection; "loud" with no measurement; guard status "could not be confirmed"; crane load exception) |
| CONFIDENCE_IMPROVING | 7 |
| NONESSENTIAL / REDUNDANT / REPEATED_CONTEXT | 0 / 0 / 0 |
| **Clear findings with useful initial analysis and NO clarification** | **12 / 12 = 100 %** (before this session's fixes: 5 / 12 — see defects below) |
| Ambiguous cases correctly asking or stating insufficient evidence | 7 / 7 |

Unnecessary-question defects found and fixed (each was a NONESSENTIAL/REDUNDANT/REPEATED_CONTEXT source before):
- three separate per-regime jurisdiction yes/no questions → one consolidated inspection-scoped question (REPEATED/REDUNDANT);
- "Was the equipment energized?" asked after the observer wrote "power connected" / "the running press" / "still
  plugged in" / "has not been de-energized" (REDUNDANT) → recognised as energised; and an explicitly non-isolated
  energy source now satisfies "hazardous energy present or capable" instead of asking;
- energy questions on a verified-safe LOTO description ("lockout/tagout procedure was followed… zero-energy state
  was verified") → recognised as isolated_and_verified (NONESSENTIAL);
- clear MSHA guarding ("guard on the conveyor tail pulley at the surface mine is missing") produced three generic
  machine questions because the guard-missing regex window was too short (NONESSENTIAL);
- exposed conductors / no guardrail / no trench box / 92 dBA TWA / dry-cutting concrete not extracted → generic
  follow-ups instead of a supported standard (NONESSENTIAL);
- spurious findings from taxonomy noise (`hot_work` from "grinding area"/"worker", `heat_stress`/`training` from
  "worker", `noise` from "equipment"/"cloud", `walking_working_surfaces` from the fused metadata line
  "Work area: third-floor deck", `conveyors` from the LOTO sentence's own "belt is capable of starting").

The metric was not manipulated by hiding questions: every remaining question in the audit is either
decision-critical or confidence-improving on a genuinely under-specified observation, and terse manual findings
still ask (see E). Remaining known nonessential questions: the terse "Damaged electrical cord." case receives two
panel/enclosure-oriented follow-ups ("Is the cover or door fully closed…", "Are unqualified persons able to access
this panel…") from the service layer's electrical question bank — off-target for a cord; not fixed this session
(protected reasoning path; documented).

---

## HUMAN REVIEW BEHAVIOUR (Section K)

Investigated: `requiresHumanReview: true`, `reviewStateLabel`, `resultStage/mayFinalize`, `blocksFinalization` /
`safetyDecisive` on questions are **governance/presentation metadata**. Per the finalization-gate design record
and confirmed by tracing `inspection.service.ts` and the workspace: none of them is consumed by the persisted
workflow. The only real gate is the human-review record: `finalizeFinding()` requires a current review, and the
transition to `completed` requires every current finding to be finalized/dismissed with a valid review. HazLenz
therefore never needs a human confirmation to *produce* an assessment; the professional's oversight is exercised
at review/finalize (edit risk, edit corrective action, override, dismiss — all preserved).

Presentation was aligned to that reality: the review step heading "Human review required" → "HazLenz assessment
— review before finalizing" (with a one-line explanation), status text no longer says "human confirmation is still
required", the "Essential clarification" panel → "Clarification" with a per-question badge (Decision-critical /
Optional, from the engine's own priority flags now passed through `guidedFinding.clarificationQuestions`) and the
statement "None blocks your review". Genuine low-confidence safeguards were not weakened: unresolved predicates
still yield candidate-only standards, insufficient evidence still yields the insufficiency question, and the
review/finalize requirement is untouched.

---

## PHASES 13–15 (Standard Detail UI · report standards integrity · corrective-action/standard coherence)

- **Standard Detail (13):** `resolveSelectedFindingStandard()` now reads the selected finding's OWN persisted
  `sourceCandidate.standardCandidates` (finding-scoped) before falling back to the whole-observation primary; a
  multi-finding observation whose selected finding has no candidate shows "No standard established" rather than a
  sibling's citation; the eyebrow says "jurisdiction inferred by HazLenz" when applicable; the first finding is
  selected immediately after analysis (previously the panel showed the whole-observation primary until a finding
  was clicked). Verified in Chromium: switching findings switched 1926.416(a)(1) ↔ 1926.501, and MSHA
  56.14107(a) ↔ 56.12016. An internal API-boundary note ("Candidate standard recovered at the API boundary…") that
  leaked into the "HazLenz standard summary" is no longer shown.
- **Report standards integrity (14):** driving the full UI flow exposed that the review-finalize call sent the whole
  finding row as `sourceCandidate`, burying `observationFragment`/`standardCandidates` one level down — the first
  PDF read "What was observed: cord" and "Applicable standard: Not established" for findings with direct
  standards (`phase16-reports/report-construction-first-run-BEFORE-finalize-fix.pdf`). Fixed on both sides: the
  workspace sends the finding's own candidate object; the backend merges (never replaces) `sourceCandidate` and
  the reviewer-confirmed risk over the system snapshot. The GI and MSHA PDFs show each finding's own fragment,
  its own standard with citation + family + summary, and finding-scoped risk (severity/likelihood/score). The
  inspection context is printed in "Inspection Information". No cross-finding leakage in any PDF.
- **Corrective-action coherence (15):** the shared whole-observation action draft was attached to every finding's
  review, so the fall-protection finding's finalize-time action carried the electrical text (first PDF). Fixed:
  reviews no longer carry the unreviewed shared draft (the finding-scoped `correctiveActionIntelligence` is used),
  the completion step maps the confirmed action to each finding's own family (`lockout_tagout` was missing from the
  family map), a single-finding inspection uses the reviewed draft verbatim, and the completion-step action now
  upserts the finding's canonical corrective-action record instead of creating a duplicate row (one action per
  finding; audit `ACTION_UPDATED`). MSHA PDF: guarding → "Keep the equipment out of service… restore guarding…";
  LOTO → "Stop servicing and control hazardous energy… zero-energy verification".

---

## PHASE 16 — NEW END-TO-END CHROMIUM INSPECTIONS

Three complete inspections through the real UI at `:3010` (session seeded from an API login; no credentials
typed into forms), each: `/inspections` → choose context → Start Full Inspection → workspace shows persisted
context → observation containing a HazLenz-narrative sentence and a "Manual finding: …" sentence → "Save and
review with HazLenz AI" → review (Standard Detail per finding, no clarification section) → risk → finalize each
finding → Action → "Complete inspection and generate report" → PDF downloaded and read.

| Inspection | Context chosen | Findings | Standards (finding-scoped) | Questions | PDF |
|---|---|---|---|---|---|
| Riverside Bridge Deck — roofer at unprotected edge + manual: energized cord with exposed conductors | OSHA — Construction (Settings default) | fall_protection, electrical (a spurious `walking_working_surfaces` from the fused "Work area:" metadata line was found and fixed live; superseded on reanalyze) | 1926.501 direct / 1926.416(a)(1) direct | none | first PDF exposed the finalize-path defects above (kept as evidence); |
| Packaging line — mechanic servicing case sealer, power connected, no lock/tag + manual: cord exposed conductors, plugged in | OSHA — General Industry (chosen explicitly, non-default) | lockout_tagout, electrical (spurious `conveyors` from "belt is capable of starting" found and fixed live) | 1910.147 direct / 1910.303 direct | none | `report-general-industry.pdf` (sha256 2300714…): per-finding evidence + standard + risk ✓ |
| Surface mine — guard missing on crusher conveyor tail pulley + manual: miner servicing screen deck drive, no lock/tag | MSHA (chosen explicitly) | machine_guarding (Critical), lockout_tagout (High) | 30 CFR 56.14107(a) direct / 56.12016 direct | none | `report-msha.pdf` (sha256 68c1542…): context row, per-finding standard, one coherent action per finding, no OSHA ✓ |

Persistence across reload/navigation verified (workspace reloaded mid-review restored context, findings and
the finding-scoped panel). Report list (`/reports`) now shows "Full Inspection · Riverside Bridge Deck Project ·
OSHA — Construction/General Industry/MSHA" with record IDs demoted to a details toggle (Phase 17 item).
Report storage in this disposable environment requires `STORAGE_PROVIDER=local_test` (S3 is unconfigured here —
the same documented environment gap as the prior QA session); the backend was restarted with local test storage
for the PDF steps.

## PHASE 17 — UX closure items

Done: review-step wording and question badges (K); persisted regulatory-context display + change control in the
workspace; HazLenz-evaluated context/provenance line with "Confirm for this inspection" for inferred regimes;
finding auto-selection after analysis; report list humanised (title · site · context; IDs behind "Record IDs");
internal diagnostic note removed from the standard summary. Not done (out of scope, unchanged): dashboard
program counters on `/inspections` (localStorage seed data), the pre-existing `<body>` theme hydration warning
(RootLayout, seen on every page load in dev).

## STANDARDS GOLD SET (Section O)

`standards-gold-set/gold-set-script-v2.ts` — 25 cases (20 applicable, 5 negative controls), expected answers
established from osha.gov / govinfo.gov (30 CFR) text and recorded per case with `mustNotReturn` for the sibling
regime; five Construction cases added this session for the four verified 1926 rules plus a below-Table-D-2 noise
negative control. Scored against CONFIRMED (SUPPORTED/direct) matches only:

| Total | Correct | False positives | False negatives | Wrong-regime | Wrong-finding | Unresolved | Precision | Recall |
|---|---|---|---|---|---|---|---|---|
| 25 | 19 TP + 5 correct no-match | 0 | 1 | 0 | 0 | 1 (GI-PIT-01: no powered-industrial-truck rule exists in `evaluate()`; the honest empty result is what that case's own rationale requires — counted as the FN) | **1.00 (19/19)** | **0.95 (19/20)** |

Start of this task: precision 1.00, recall 0.56 (9/16). The recall gain came from ordinary-phrasing extraction
fixes ("no guardrail", "no trench box/sloping/shoring", "dry-cutting", "without a functional backup alarm",
"taken out of service" no longer read as *servicing*), from confirmed jurisdiction resolving candidates to
SUPPORTED, and from the four verified Construction rules — not from relaxing any predicate. Corpus integrity
regression: all invariants pass (18-row corpus unchanged this session; the four new 1926 citations have no corpus
row yet — see KNOWLEDGE_FRESHNESS.md item 4; the UI states verbatim text is unavailable rather than fabricating).

## LEARNING ARCHITECTURE (Section L)

`LEARNING_ARCHITECTURE.md`. Verified: HazLenz does **not** self-learn. Corrections are durably captured
(`human_reviews` decision/rationale/reviewedConclusion, reviewer-confirmed risk, `SafeScopeFeedback`), but the only
aggregation (`getWorkspaceStandardAdjustments`) has no consumer in the reasoning path. Recommended governed path
connects existing pieces (correction-event projection → aggregation → reviewcore adjudication queue → frozen
regression case → reviewed rule/taxonomy/corpus change through the regression gate); nothing mutates production
behaviour from individual corrections. Not built.

## KNOWLEDGE FRESHNESS (Section M)

`KNOWLEDGE_FRESHNESS.md`. Verified: a real, allow-listed (osha.gov / eCFR / msha.gov) ingestion scaffold exists
with source registry, checksums, retrieval/effective dates, approval states, release ids and run logs — all run
manually. Missing for routine freshness: scheduled re-check + change alerts, an ingestion-time title/citation
consistency validator, a regression gate on promotion, rule↔corpus linkage (`evaluate()` is hand-authored), and
population of `regulatory_paragraph`. No continuous ingestion is claimed.

---

## ROOT CAUSES ESTABLISHED (this session)

1. Jurisdiction was page-local, unpersisted, duplicated (Settings default vs workspace "Site context"), and
   re-asked per candidate regime (three yes/no predicate questions) — no inspection-level model existed.
2. LOTO recall gap: detectors required the literal words "lockout/tagout" and named energy types; "no lock or tag
   applied", "without isolating", "power connected", "the running press" were invisible; a bare machine-entity word
   in a servicing sentence spawned a weak guarding finding instead.
3. Extraction windows/synonyms too narrow for ordinary phrasing (exposed copper conductors, no guardrail, no trench
   box, 92 dBA 8-hour TWA, dry-cutting, guard-missing across a 47-character clause, without a functional backup
   alarm) → candidates/no candidates + generic questions instead of supported standards.
4. Taxonomy noise: single generic entity words (`work`, `worker`, `hot`, `watch`, `equipment`, `loud`) routed
   unrelated fragments to hot_work/heat_stress/training/noise; fused structured-metadata lines ("Work area: …") were
   decomposed as observations.
5. Construction had no rules for hazcom/noise/electrical/guarding conditions (honest gap, verified and added).
6. Finalize path: the workspace sent the finding wrapper as `sourceCandidate` (evidence/standards buried) and the
   shared unreviewed action draft as every finding's action; reviewer risk replaced the system snapshot; completion
   duplicated corrective actions and its family map lacked `lockout_tagout`.
7. A LOTO sentence selector matching bare "energized" pulled a sibling electrical sentence into the LOTO finding
   (caught by the new invariant 10a); the 56.12025 conductive-pathway predicate reported CONTRADICTED when unstated.

## FILES CHANGED (this session; all uncommitted, on top of the earlier phases' edits)

Backend: `inspection/inspection.entity.ts` (+enum, provenance helper, column), `inspection/dto/inspection.dto.ts`,
`inspection/inspection.service.ts` (create/update context + audit; sourceCandidate/riskSnapshot merge on finalize),
`database/migrations/1800000009000-InspectionRegulatoryContext.ts` (new), `safescope-v2/dto/classify.dto.ts`
(`inspectionId`, `regulatoryContext`), `safescope-v2/safescope-v2.controller.ts` (authoritative inheritance),
`safescope-v2/safescope-v2.module.ts` (imports InspectionModule), `safescope-v2/evidence/shared-evidence-facts.ts`
(jurisdiction resolution/provenance/inference, consolidated question answer, extraction generalisations),
`safescope-v2/evidence/evidence-foundation.ts` (provenance on decisions, response `regulatoryContext`, per-finding
forwarding, sentence ownership, consolidated jurisdiction question, energyCapable, 4 Construction rules, 56.12025
predicate), `safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` (shared LOTO
vocabulary, LOTO sentence qualifier, weak-route guards, hot-work activity test, silica reroute, metadata-line
filter), `safescope-v2/display/guided-finding-response.ts` (question criticality passthrough, no internal note),
`reports/canonical-reports.service.ts` (context in snapshot; humanised list), `reports/canonical-report-pdf-renderer.ts`
(context row, inferred-provenance prefix), `corrective-actions/corrective-actions.service.ts` (per-finding upsert),
`safescope-v2/tests/hazlenz-inspection-context-autonomy-regression.ts` (new, 14 invariants / 44 checks),
`safescope-v2/tests/hazlenz-jurisdiction-unknown-standards-regression.ts` (stale snapshot-recovery expectation
replaced by accumulated-history + provenance-honesty checks), `safescope-v2/tests/hazlenz-core-regression.ts`
(suite registered). Data: `safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json` (hot_work,
heat_stress, training_competency, noise entities). Frontend: `lib/canonicalWorkflowApi.ts`, `app/inspections/page.tsx`,
`app/inspection-workspace/page.tsx`, `app/reports/page.tsx`. Disposable DB: migration applied; QA user + grant.

## REGRESSION RESULTS (final sweep, all actually executed)

See `regression-logs/final-*.log`. Backend `tsc --noEmit`: clean. Frontend `tsc`: clean (only the pre-existing
duplicate `.next/types/* 2.ts` generated files). `test:hazlenz-core`: 29 suites — the new invariants suite passes
(44/44); the jurisdiction-unknown suite passes; the only failures are the two documented pre-existing baseline
failures (Golden Hardening #7 "LOTO energized maintenance", Production Path "tagged but not locked"), unchanged
before/after and confirmed identical to the pre-session logs. `test:safescope` 11/12 (same pre-existing
"Maintenance without lockout" case), `test:safescope-standards` 15/15, `test:safescope-domains` pass,
`test:safescope-operational` pass, `test:standards-corpus-integrity` pass. Gold set precision 1.00 / recall 0.95.
Live harness (final run after all changes): D 36/36 as tabulated; E as tabulated; autonomy 12/12 clear without
clarification, 7/7 ambiguous asking, 0 nonessential/redundant/repeated-context.

## REMAINING ISSUES / UNCERTAINTY

1. Rule coverage gaps in `evaluate()` (honest empties, no leakage): Construction LOTO (1926.417/.702(j)) and egress
   (1926.34), GI powered industrial trucks (1910.178), MSHA noise/hazcom, GI scaffolds. Under those gaps the
   service layer still emits generic `existing-*` follow-ups.
2. Terse "Damaged electrical cord." receives two panel/enclosure questions from the service question bank
   (nonessential for a cord).
3. The four added 1926 citations have no `standards_master` corpus row (UI/PDF show family as title, verbatim
   text disclosed as unavailable).
4. HazLenz jurisdiction inference is deliberately conservative (mine/miner/quarry/MSHA; construction site/jobsite/
   roofer/mason/ironworker/general contractor; warehouse/factory/manufacturing/shop floor/assembly line…);
   ambiguous vocabulary (scaffold, trench, crusher, plant) is never inferred — the one question is asked instead.
5. Report storage needs S3 (or `STORAGE_PROVIDER=local_test`) — environment, not product.
6. Two documented pre-existing test failures remain untouched (unrelated to this scope).
7. Not re-run this session: `next build` (dev server occupies `.next`; frontend `tsc` is clean and every changed
   page was exercised live in Chromium).

## FINAL READINESS

INSPECTION_CONTEXT_READY: **YES**
HAZLENZ_AUTONOMY_READY: **YES**
CLARIFICATION_EFFICIENCY_READY: **YES**
DIRECT_FINDING_STANDARDS_READY: **YES**
STANDARDS_CORPUS_INTEGRITY_READY: **YES** (18-row corpus verified; new 1926 rules verified at source but not yet in corpus — disclosed honestly in UI/PDF)
STANDARDS_MATCHING_READY: **YES** (precision 1.00, recall 0.95, 0 wrong-regime; documented rule gaps return honest empties)
STANDARDS_UI_READY: **YES**
MULTI_HAZARD_OWNERSHIP_READY: **YES** (same-domain multiple-finding architectural limit from the predecessor report still applies)
CORRECTIVE_ACTION_OWNERSHIP_READY: **YES**
REPORT_DATA_INTEGRITY_READY: **YES**
HAZLENZ_CORE_READY: **YES**
INSPECTION_WORKFLOW_READY: **YES**

**OVERALL_PRODUCT_READY: YES** — against the stated acceptance standard: in three real Chromium inspections a
safety professional set the regulatory context once, described what they observed naturally (including a terse
manual finding statement), and received a defensible HazLenz assessment with accurate finding-specific standards
and corrective actions with zero clarification prompts; genuinely ambiguous observations still receive one
targeted question. The remaining items above are documented coverage gaps and environment notes, not defects in
the verified path.

---

## PRE_COMMIT_RELEASE_CANDIDATE_CLOSURE

Date: 2026-08-18 (same session, after the accepted A–Q candidate). Purpose: resolve or disposition the
remaining caveats, prove the production builds, and freeze the candidate. No architecture was redesigned;
already-passing HazLenz behaviour was preserved and re-verified (see items 8–13). Nothing was committed, pushed,
deployed, reset, reverted or stashed.

**1. Files changed during this final pass** (all uncommitted; on top of the accepted candidate)
- `backend/src/safescope-v2/safescope-v2.service.ts` — topical filters for the intelligence-layer follow-ups
  (enclosure/panel questions only with enclosure context; redundant "is the cord damaged" and duplicate "bare
  conductors" dropped); generic vague-fallback questions suppressed once a specific ACTIVE finding exists;
  `machine-energy-state` / `machine-controls` triggers recognise the same stated-fact phrasings as the evidence
  model ("power connected", "no lock or tag applied", "without isolating"…); new
  `hydrateFindingScopedStandards()` (corpus hydration of the deterministic decisions and per-finding candidates).
- `backend/src/safescope-v2/safescope-v2.controller.ts` — calls the hydration after the finding-scoped stage.
- `backend/src/safescope-v2/display/guided-finding-response.ts` — `standardRecords()` reads the (retained,
  hydrated) `standardDecisions` first, so corpus titles/summaries reach the guided card.
- `backend/src/safescope-v2/evidence/shared-evidence-facts.ts` — "removed/taken out of service" (negation-aware)
  is a controlled condition; new `pitState` fact; container vocabulary (drum/pail/can/tote/carboy/tank/bag);
  "maintenance shop/department/…" no longer read as servicing activity.
- `backend/src/safescope-v2/evidence/evidence-foundation.ts` — rules `29 CFR 1926.34(a)`, `29 CFR 1910.178(p)(1)`,
  `30 CFR 62.120`, `30 CFR 62.130`, `30 CFR 47.41(a)`; corpus fields on `FindingStandardCandidate`.
- `backend/src/safescope-v2/standards-intelligence/standards-intelligence.seed.ts` (+8 records),
  `…/standards-intelligence.types.ts` (`sourceUrl`, `retrievalDate`),
  `backend/src/standards/seed/sync-standards-intelligence-to-master.ts` (maps `sourceUrl`/`retrievalDate`).
- `backend/src/reports/canonical-report-pdf-renderer.ts` — corpus title + summary for decomposed findings.
- `frontend-next/app/inspection-workspace/page.tsx` — Standard Detail prefers the candidate's corpus title/summary;
  `findingScopedActionDraft()` so unmapped families (hazcom, egress…) use the finding's own action, never a
  sibling's draft.
- `backend/tmp/gold-set-script.ts` (+6 cases; copy at `standards-gold-set/gold-set-script-v3.ts`),
  `GAP_ADJUDICATION_SOURCES.md` (new), harness/PDF/log artifacts.
- Disposable DB only: 8 `standards_master` rows added via `sync … --apply` + `finalize-regulatory-release`
  (26 rows, no duplicates, release checksums stamped).

**2. Damaged-cord question root cause.** For a terse observation the service treats the text as *vague* and
surfaces the inspection-intelligence expert rules' `followUpQuestions` wholesale; the enclosure live-parts rule
(`elec-exposed-live-*`, 1910.303(g)(2)(i)) matches on the bare word "electrical", so its cover/door/panel/enclosure
questions led the list although no enclosure was described. Separately "removed from service" was not recognised
as a controlled state by the evidence layer, so a controlled cord kept High risk and questions.

**3. Damaged-cord before/after** (`harness/cord-before.json`, `cord-after2.json`; live GI inspection):

| Observation | Before | After |
|---|---|---|
| Damaged electrical cord. | `electrical-damage-exposure` (decision-critical) + "enclosure parts missing", "cover or door closed/latched", "unqualified persons access panel/enclosure" | `electrical-damage-exposure` + voltage / wet-or-damp location / GFCI–travel path (cord-relevant, confidence-improving; guided card shows 3) |
| Worker is using a damaged electrical cord. | `electrical-damage-exposure` only | unchanged |
| Extension cord has damaged insulation. | `electrical-damage-exposure` only | unchanged |
| Electrical cord is frayed near the plug. | `electrical-damage-exposure` only | unchanged |
| Cord is damaged but has been removed from service. | SAFE_VERIFIED but risk **High**, exposure question + 3 generic questions | SAFE_VERIFIED, risk **Controlled**, guided card: **no** questions (legacy `assessmentDisposition` label unchanged — request-shape boundary, cosmetic) |

The active variants are not treated identically to the controlled one. Zero decision-critical questions were removed.

**4. Disposition of the four new 1926 corpus rows.** The production architecture expects a `standards_master`
row per cited provision (`title` = official heading, `plain_language_summary` = HazLenz-authored summary labelled
as such, source registry metadata, release checksums); verbatim text lives separately in `regulatory_paragraph`
(empty for *every* citation in this environment, disclosed as such in the Standard Detail expansion — that
disclosure is about verbatim eCFR ingestion, not missing corpus rows). Rows added and CORPUS_BACKED for
`29 CFR 1926.59` (Hazard Communication), `29 CFR 1926.52` (Occupational noise exposure), `29 CFR 1926.416(a)(1)`
(Electrical … protection of employees from contact with electric power circuits), `29 CFR 1926.300(b)(2)` (Tools …
Guarding: moving parts of equipment exposed to contact) — titles from the osha.gov headings fetched this session,
summaries tracking the captured text, `source_key osha-ecfr-1926`, `source_url`, `retrieval_date 2026-08-18`,
`release_id federal-core-2026-07-30.1`, `normalized_record_checksum` set. Verified through the normal path: the
finding-scoped candidates carry `title/plainLanguageSummary/sourceKey/corpusBacked=true`, the guided card shows the
corpus title/summary, and the final PDF prints them (see item 14). This also surfaced (and fixed) a pre-existing gap:
the display sanitizer strips `primaryStandards/suggestedStandards/standards` before the guided response is attached,
so *no* corpus title had ever reached the guided card — existing rows (e.g. `1910.147 → The control of hazardous
energy`, `30 CFR 56.14107(a) → Moving machine parts`) now display correctly too.

**5. Disposition of the five known rule-coverage gaps** (`GAP_ADJUDICATION_SOURCES.md` has the verified text):

| Gap | Classification | Action | Evidence | Final behaviour |
|---|---|---|---|---|
| OSHA Construction — LOTO | REQUIRES_MORE_DOMAIN_WORK (intentionally unsupported) | No rule (1926.417 = tagging of electric circuits, not a general servicing-lockout requirement); redundant service-layer questions on stated facts fixed | gold `CON-LOTO-01-GAP` (honest empty; forbids 1910.147/56.12016) | finding + risk + action, no confirmed citation, no questions |
| OSHA Construction — egress | MISSING_RULE_WITH_CLEAR_AUTHORITATIVE_SUPPORT | rule + corpus row `29 CFR 1926.34(a)` | osha.gov 1926.34(a)/(c) | chained exit → 1926.34(a) SUPPORTED, corpus-backed |
| OSHA GI — PIT | MISSING_EXISTING_CORPUS_MAPPING (row existed, rule did not) | `pitState` fact + rule `29 CFR 1910.178(p)(1)` | osha.gov 1910.178(p)(1) | GI-PIT-01 → TRUE_POSITIVE; truck taken out of service = controlled |
| MSHA — noise | MISSING_RULE_WITH_CLEAR_AUTHORITATIVE_SUPPORT | rules + rows `30 CFR 62.120` (TWA8 ≥ 85) and `30 CFR 62.130` (TWA8 > 90) | govinfo.gov 30 CFR 62.101/62.120/62.130 | 92 dBA → both; 87 → 62.120 only; 80 → none |
| MSHA — HazCom | MISSING_RULE_WITH_CLEAR_AUTHORITATIVE_SUPPORT | rule + row `30 CFR 47.41(a)` | govinfo.gov 30 CFR 47.41 | unlabelled drum at mine → 47.41(a) SUPPORTED, no OSHA HazCom |

**6. Frontend production build:** dev server on :3010 stopped; `NEXT_PUBLIC_API_URL=http://localhost:4010
NEXT_PUBLIC_API_BASE_URL=http://localhost:4010 NEXT_PUBLIC_DISABLE_AUTH=false npx next build` → exit 0,
"✓ Compiled successfully", 26/26 static pages generated (`regression-logs/final-frontend-build.log`); dev server
restarted with the original command. Frontend `tsc --noEmit`: clean (only the pre-existing duplicate
`.next/types/* 2.ts` generated files).

**7. Backend build:** `npx tsc --noEmit` clean; `npm run build` (`tsc` → gitignored `dist/`) exit 0
(`regression-logs/final-backend-build.log`).

**8. Final jurisdiction matrix:** 36/36 live cases (`harness/D_JURISDICTION_MATRIX.md`): GI → 1910 rules only;
Construction → 1926 rules only (now incl. 1926.34(a)); MSHA → 30 CFR only (now incl. 62.120/62.130/47.41(a));
unknown → cross-regime UNKNOWN candidates + exactly one `jurisdiction` question; `warehouse` case inferred
HAZLENZ_INFERRED; no cell re-asks jurisdiction after context is established; the only remaining generic
follow-ups (GI/MSHA excavation, MSHA egress) are gone — no `existing-*` question anywhere in the matrix.

**9. Final autonomy/clarification:** 19 observations / 20 findings / **11** questions (was 13): 6 DECISION_CRITICAL,
5 CONFIDENCE_IMPROVING, 0 NONESSENTIAL / REDUNDANT / REPEATED_CONTEXT; **12/12 clear cases with zero
clarification; 7/7 ambiguous cases asking**; engine-flagged blocking 3 (all in ambiguous cases; nothing blocks the
workflow) (`harness/F_AUTONOMY_AUDIT.md`).

**10. Final standards precision:** **1.00** (24/24 confirmed matches correct; 31-case gold set,
`regression-logs/gold-set-closure.txt`).
**11. Final standards recall:** **1.00** (24/24 applicable cases; the Construction-LOTO gap is scored as an
intentional correct no-match, not an applicable case).
**12. Wrong-regime count:** **0** (also 0 false positives; 7/7 negative controls correct).

**13. Final regression results** (`regression-logs/closure-*.log`, all executed after the last code change):
`test:hazlenz-core` — 27/29 suites pass; the only failures remain the two documented pre-existing baseline
failures (Golden Hardening #7 "LOTO energized maintenance", Production Path "tagged but not locked"); the
14-invariant Inspection-Context/Autonomy suite and the Jurisdiction-Unknown suite pass. `test:safescope` 11/12
(same pre-existing case), `test:safescope-standards` 15/15, `test:safescope-domains` pass,
`test:safescope-operational` pass, `test:standards-corpus-integrity` pass (26-row corpus, no duplicates).
Finding integrity re-verified live: no metadata fragments or phantom findings in the three-finding Construction
inspection; finding-scoped ownership (each finding one own citation); one corrective action + one task per
finding; the LOTO family maps to the LOTO action at completion (MSHA/GI runs earlier in the report). Persistence
verified in the DB for a completed inspection: `inspection.regulatoryContext=msha` → analysis snapshot
`regulatoryContext {msha, USER_CONFIRMED, inspection}` → both findings' candidates `USER_CONFIRMED` → report
snapshot `inspection.regulatoryContext=msha`; workspace reload mid-review restores context and finding-scoped panel.

**14. Final PDF inspection:** new Chromium inspection after the last change (Construction; occupied-building
chained exit + unlabelled solvent container + manual: energized cord with exposed conductors) → three findings,
no clarification, corpus-backed Standard Detail per finding → review/finalize each → complete → report
`phase16-reports/report-construction-closure-final.pdf` (sha256 `9f1fe806…`). Opened in Chrome and visually
inspected: cover, executive summary, Inspection Information with "Regulatory context: OSHA - Construction (29 CFR
1926), set for this inspection", Findings Summary (Egress Moderate / Electrical High / Hazard Communication
Moderate), Detailed Findings each with its own fragment, finding-scoped risk (severity·likelihood·score), corpus
title + "HazLenz standard summary … HazLenz basis …", qualified-person review, and its own corrective action
("Verify and correct reviewed condition N" — egress → egress action, electrical → electrical, hazcom → hazcom).
Cosmetic notes only: the footer page numbering excludes the cover ("Page 4 of 6" in a 7-page viewer count) and one
corrective-action heading falls at a page break — both pre-existing renderer behaviour, not data defects.

**15. Final `git diff --check`:** PASS (clean).
**16. Final `git status --short`:** `git-status-after-closure.txt` — 31 modified files (2 291 insertions,
223 deletions) + 9 new source files (1 migration, 8 regression suites) + verification/ and backend/tmp untracked
artifacts; nothing staged.
**17. Four pre-existing stashes untouched:** `stash@{0..3}` present with their original 6- and 9-week-old
timestamps (`git stash list` in this session's log); no stash/pop/apply performed.
**18. Original `safescope` database untouched:** 0 `regulatoryContext` columns on `inspection`, 0 of the new
`standards_master` rows, last migration still `FindingScopedRiskSnapshot1800000005700`; every migration/seed run
this session printed and used the disposable target `insite_full_qa_20260818` with `DATABASE_URL` overridden.
**19. Nothing committed / pushed / deployed:** HEAD remains `97941ca2`; no remote or production system touched.

### Final classification

**RELEASE_CANDIDATE_READY**
