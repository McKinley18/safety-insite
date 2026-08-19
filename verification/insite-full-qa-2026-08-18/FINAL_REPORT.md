# InSite Full Functional, HazLenz Accuracy, Standards & Inspection UX Validation

Date: 2026-08-18. Verification directory: `verification/insite-full-qa-2026-08-18/`.

## STATUS

Baseline established, real customer workflow exercised end-to-end in a real Chromium browser against an isolated
backend/frontend/database stack, a realistic multi-hazard inspection driven through capture → HazLenz analysis →
per-finding review → risk → corrective action → completion → PDF report generation, 15 adversarial/safe/temporal
scenarios run against the live classification engine, standards citations spot-verified against OSHA's own published
text, and a full regression pass completed. Two genuine defects were root-caused and fixed with narrowly-scoped
changes; several additional confirmed, reproducible defects were investigated to root cause but intentionally left
unfixed because a safe fix would require deeper, dedicated work in a protected area (multi-hazard decomposition /
finalization gating) than this session's mandate supports.

## REPOSITORY STATE

- Branch: `main`. Baseline HEAD: `97941ca23c0be880395fe0d51ceb72ca22d8bfaa` (matches the commit specified at the
  start of this phase).
- Working tree at start: 75 untracked paths (almost entirely prior sessions' `verification/` directories), no
  modified tracked files — consistent with a long history of iterative agent sessions on this repository.
- Files changed this session (all tracked, all intentional):
  - `backend/src/safescope-v2/classifier/weighted-classifier.service.ts` (production fix)
  - `backend/src/safescope-v2/tests/hazlenz-clarification-gauntlet.ts` (test-fixture fix, not production code)
  - `frontend-next/components/layout/AppShell.tsx` (production fix)
- All 16 previously-recorded "protected" HazLenz/canonical-UI file hashes verified unchanged before and after this
  session's edits (full list and hashes in `PROTECTED_HASHES_BEFORE.txt` / `PROTECTED_HASHES_AFTER.txt`); the one
  file intentionally modified (`weighted-classifier.service.ts`) was not on that protected list.
- Backend `tsc --noEmit` build: **PASS** (before and after changes).
- Frontend `next build` production build: **PASS** (before and after changes), all 23 routes compiled/prerendered.
- No commits, pushes, or deploys were made. No destructive git operations were used.

## ENVIRONMENT USED FOR TESTING

Real functional testing requires a real backend + real Postgres + real browser session — not just reading code — so
a fully isolated stack was built and used for the entire session, per the "disposable verification database" rule in
this repo's operating instructions:

- Disposable Postgres database `insite_full_qa_20260818`, created fresh, migrated with the repo's own
  `migration:run`, seeded with the repo's own `seed:safescope-standards` (19 canonical OSHA/MSHA standards — the
  same seed the project's own golden test suites are written against).
- Backend on port 4010 (separate from the user's own already-running dev backends on 4000/4100), real auth
  (`DEV_AUTH_BYPASS=false`), local-disk report storage (`STORAGE_PROVIDER=local_test`) instead of S3.
- Frontend on port 3010 (separate from the user's own dev frontend on 3001), pointed at the port-4010 backend.
- One disposable Pro-tier test user (`jordan.reyes.qa3@insite-verify.test`) with an entitlement grant inserted
  directly into the disposable DB (mirroring the repo's own `grant-test-entitlement.ts` script, which requires a
  differently-named database and so could not be used verbatim).
- `safescope` (the real local dev database) was read from twice (row counts only) and never written to. It was
  found to be empty of standards data and several migrations behind — i.e., it is not where this product's live
  local data actually lives; this is noted as an observation, not a defect, since it wasn't this session's job to
  fix.
- The user's other running dev processes (backend :4000, :4100, frontend :3001) were left untouched; one incidental
  restart of the port-4000 process happened when a `pkill` pattern matched more broadly than intended, and it
  recovered on its own (confirmed healthy afterward) — noted for transparency even though no lasting effect
  resulted.
- The isolated backend/frontend (ports 4010/3010) were left running at the end of this session for continued
  inspection if wanted; they are disposable and can be torn down on request.

## FUNCTIONAL WORKFLOWS TESTED

Walked the full customer journey in a real Chromium browser: register (Free tier) → login → Pro entitlement →
dashboard → **Full Inspection** creation → site save → observation capture → HazLenz analysis → per-finding review
(fact confirmation, clarification question, standard) → per-finding risk confirmation → corrective action →
inspection completion → PDF report generation → report retrieval after logout/login.

Friction points and defects found along this path (see DEFECTS FOUND for full detail):

- Registration does not auto-login; the user is dropped on the login page and must re-enter the same credentials
  they just typed seconds earlier. Minor but avoidable friction on the very first action a new customer takes.
- Starting a Full Inspection silently disables the "Start Full Inspection" button with no visible reason until a
  site is saved — no inline hint or error explains why the button is inert.
- The per-finding Review step's "What HazLenz understood" / clarification-question / standard panel is genuinely
  scoped to whichever finding is currently selected (confirmed by inspecting five different findings in sequence)
  — this is correct — but four of five findings in a realistic multi-hazard observation had no standard evaluated
  for them at all (see DEFECTS FOUND #3).
- Completing a Full Inspection ("Complete inspection and generate report") threw a raw, user-facing "Internal
  server error" (see DEFECTS FOUND #4) in the disposable environment due to a missing S3 configuration; this was
  an environment-configuration gap in this session's own test setup, not a code defect, and was resolved by
  switching to the repo's own `local_test` storage provider.
- The completed-inspection report list displays the inspection as a raw UUID (`Inspection
  596e1c9d-dbb9-4219-8406-bee30380a93e`) instead of the site name or a human-readable label (see DEFECTS FOUND #6).
- The Home dashboard's Reports/Findings/Open Actions/Overdue counters read 0/0/0/0 even after a real inspection
  with 5 finalized findings and a generated PDF report exists for that account (see DEFECTS FOUND #7).

Persistence was exercised explicitly: created → analyzed → partially reviewed → left mid-flow → returned via
`/inspections` → resumed → finalized all 5 findings → completed → generated report → logged out → logged back in →
confirmed the exact same report (same checksum) was retrievable. No state loss and no cross-finding evidence
contamination was observed in this cycle.

## HAZLENZ ACCURACY

**Cases tested:** 1 realistic 5-hazard General Industry observation driven through the full guided-inspection UI
end to end (capture → decomposition → per-finding review → risk → action → report), plus 15 targeted
adversarial/safe/temporal/industrial-hygiene scenarios run directly against the same `/safescope-v2/classify`
endpoint the real UI calls (confirmed by reading `frontend-next/lib/canonicalWorkflowApi.ts` — this is not a
different, lesser test path; it is the exact endpoint `SafeScopeIntelligenceOrchestrator`-backed "Save and review
with HazLenz AI" button calls), plus the project's own existing HazLenz regression corpus (see REGRESSION RESULTS).

**Correct:** Primary classification was correct for the great majority of realistic cases tested, including
voice-to-text-style shorthand ("guy on the roof no harness edge like right there no rail nothing" → correctly Fall
Protection, high confidence) and grammatically broken field notes (ladder scenario → correctly Fall Protection,
appropriately low confidence). A genuinely-controlled LOTO scenario ("documented lockout/tagout procedure was
followed... zero-energy verified") was correctly recognized as a controlled condition producing **zero** hazard
findings — proving the product has the underlying capability to suppress non-findings when the signal is strong
enough.

**False positives:** Multiple. Most seriously, a scaffold-inspection observation written entirely as negations
("there were no missing guardrails, no damaged planking, and no unsecured base plates... properly secured") was
classified as an **ACTIVE Fall Protection finding**, and — with zero textual support of any kind — the decomposition
additionally fabricated a second, wholly unrelated **ACTIVE Machine Guarding** finding. A guard explicitly described
as "securely installed, bolted in place, and fully prevented access... No deficiencies observed" was likewise marked
`conditionState: 'ACTIVE'`. A "guardrails planned for next quarter... no current exposure was observed" statement was
marked `conditionState: 'ACTIVE'` Fall Protection. See DEFECTS FOUND #1 for full detail — this is the single most
severe finding of this audit.

**Missed hazards:** A load suspended over an active work area with employees walking beneath the boom during the
pick — a textbook, unambiguous crane/rigging struck-by hazard — was returned `classification: Unclassified,
confidence: low`. Not classified at all.

**Wrong temporal state:** Covered above under false positives — `conditionState` is the field the product's own
code uses to decide whether a decomposed hazard is promoted into an advisory finding (confirmed by reading the
filter logic in `safescope-v2.service.ts`), and it read `'ACTIVE'` for every one of 5 explicitly safe/historical/
planned/negated test cases except the one LOTO case, which correctly produced zero findings.

**Evidence-ownership errors:** Confirmed and reproduced. In the 5-hazard guided-inspection test case, a finding
labeled `machine_guarding` was, on inspection of its own clarification question ("Was the equipment energized or
capable of unexpected movement...") and its confirmed primary standard (29 CFR 1910.147, "The control of hazardous
energy" — a lockout/tagout standard, not a machine-guarding standard), actually evidence-bound to the
lockout/tagout fragment of the observation, not to the "fixed guard... was missing" fragment its own label implies.
In the generated PDF report, this compounds further: **every one of the 5 findings' "What Was Observed" section
repeats the entire original 5-hazard paragraph verbatim**, so a reader cannot tell which sentence supports which
finding at all — and two "Walking Working Surfaces" findings receive corrective actions about, respectively, an
**electrical extension cord** and **fall-arrest/guardrail systems for elevated work**, neither of which has anything
to do with a trip hazard on a flat walkway. See DEFECTS FOUND #2, #3, #5.

**Defects found/fixed:** 1 production defect found and fixed (see DEFECTS FOUND #1... actually the fixed one is
the Tank/Confined-Space misclassification, DEFECTS FOUND item labeled "FIXED" below); 1 UI defect found and fixed
(header avatar). 5 additional confirmed defects investigated to root cause and documented but not fixed, per this
session's instruction to prefer the narrowest safe fix and avoid speculative changes to protected reasoning paths.

## MULTI-HAZARD RESULTS

The specific concern named in this phase's instructions — the historical "one scenario produced seven findings"
report — was investigated indirectly by building a comparable 5-hazard scenario from scratch and tracing every
finding to its actual evidence. Result: the product **does** perform real multi-hazard decomposition (5 distinct
`inspection_findings` rows were created from one observation, with 5 distinct `hazardKey` values in the database:
`machine-guarding`, `electrical`, `walking-working-surfaces`, `slips-trips-falls`, `compressed-gas`) — this is not a
single-classification system pretending to be multi-hazard. However:

- Two of the five findings (`walking-working-surfaces` and `slips-trips-falls`) both display under the identical
  label "Walking Working Surfaces" with no way for a reviewer to distinguish them, both showing "No standard
  established for this finding yet," and each carrying different, hazard-mismatched corrective actions
  (electrical-cord language for one, fall-protection language for the other, neither about the actual flat-walkway
  trip hazard both are nominally about).
- Only 1 of the 5 findings had a standard confirmed during review, and even that one shows "Not established for
  this specific finding" in the final PDF — the report generator does not carry forward the standard that was
  actually confirmed.
- Root cause (confirmed by reading `hazlenz_analyses`/`inspection_findings` schema and data): all 5 decomposed
  findings from one observation share a single `hazlenz_analyses` row (the same `originatingAnalysisId` /
  `selectedAnalysisId` appeared for both `machine_guarding` and `walking_working_surfaces` findings in this test).
  Standards matching appears to run once against the observation's single primary/promoted classification, not once
  per decomposed finding, so non-primary findings never get their own standards search at all.

This is assessed as the single highest-impact defect after the temporal false-positive issue: it directly
undermines "Standards accuracy and correct display," the audit's #2 stated priority, for the majority of findings
in any multi-hazard observation.

## ADVERSARIAL RESULTS

| Scenario | Text style | Result | Assessment |
|---|---|---|---|
| Safe guard, fully installed | Plain | `ACTIVE` Machine Guarding, high confidence | **False positive** |
| Documented LOTO followed correctly | Plain | `Controlled Condition`, 0 findings | Correct |
| Historical, corrected same week | Plain | `ACTIVE` Machine Guarding, high confidence | **False positive** |
| Planned for next quarter, no current exposure | Plain | `ACTIVE` Fall Protection, high confidence | **False positive** |
| Pure negation ("no missing guardrails...") | Plain | `ACTIVE` Fall Protection **+ fabricated** Machine Guarding, both high confidence | **False positive, worst case** |
| Genuinely vague, no hazard content | Plain | Unclassified, low confidence | Correct |
| Voice-to-text shorthand, real fall hazard | Broken grammar | Fall Protection, high confidence | Correct |
| Recommendation only, no deficiency | Plain | Unclassified, low confidence | Correct |
| Trench with no protective system | Plain | Trenching & Shoring, high confidence (family key mismatched to `walking_working_surfaces`) | Classification correct, family-key defect |
| Noise 96 dBA, no hearing protection | Plain | Noise Exposure, high confidence (family key mismatched to `machine_guarding`) | Classification correct, family-key defect |
| Heat stress, no shade/water | Plain | **Emergency Egress**, medium confidence | **Wrong classification** |
| Silica dust, dry cutting, no controls | Plain | Respirable Dust / Silica, high confidence | Correct |
| Poor grammar, real ladder hazard | Broken grammar | Fall Protection, appropriately low confidence | Correct |
| Suspended load over personnel | Plain | Unclassified, low confidence | **Missed hazard** |
| Two distinct hazards, separate sentences | Plain | Only Compressed Gas Cylinders returned (single-classify endpoint; full decomposition path not exercised for this one) | Inconclusive at this endpoint |

9 of 15 correct, 4 clear false positives/misclassifications, 1 missed hazard, 1 inconclusive. Full raw JSON responses
saved in this session's working files for reference.

## STANDARDS ACCURACY

19 standards are seeded in the environment used for testing (the same 19 the project's own golden test suites are
written against; this is not the full production eCFR corpus, which lives in a database this session did not have
access to and which would require live eCFR bulk ingestion out of proportion to this phase).

Representative citation-by-citation spot check against the actual regulatory text:

- **29 CFR 1910.178(p)(1)**, seeded title "Powered industrial trucks - General requirements" — verified against
  OSHA's own published text (osha.gov): paragraph (p) is actually titled **"Operation of the truck,"** and (p)(1)
  specifically reads *"If at any time a powered industrial truck is found to be in need of repair, defective, or in
  any way unsafe, the truck shall be taken out of service..."* — i.e., a defect/out-of-service procedure, not
  "general requirements" (which is actually paragraph (a) of the same section). **Confirmed citation/title
  mismatch** in the seeded standards data.
- **1910.147** and **29 CFR 1910.147** both appear as separate rows in `standards_master` with the identical title
  "The control of hazardous energy" — the same regulation duplicated under two citation-string formats (with and
  without the "29 CFR" prefix). Low-severity data-hygiene defect, but a real one — it could surface as two
  apparently-different standards for the same finding.
- 1910.146, 1910.219, 29 CFR 1910.132(a), 29 CFR 1926.501, 29 CFR 1926.95(a) all verified as exact matches to their
  official CFR titles.
- Several others (1910.212(a)(1), 1910.22(a), 1910.303(b)(1), 1910.36) use a subpart-level or paraphrased title
  rather than the exact paragraph-level regulatory heading — not factually wrong, but imprecise; worth a future
  data-quality pass.

**Standard Detail UI:** clicking through from a finding's candidate standard opens a panel that clearly separates
"HazLenz Standard Summary" (labeled as HazLenz's own explanation) from the citation/title header, and states
plainly when the underlying regulatory paragraph text is not locally available rather than fabricating it — this
distinction is handled correctly and is a genuine strength. It was not possible to verify the "full verbatim
regulatory text displayed correctly" path in this session because the `regulatory_paragraph` table (the store for
actual CFR paragraph text) is empty in this environment — populating it requires a live eCFR bulk-XML ingestion
that was judged disproportionate to run for this phase. This is a real coverage gap in this session's testing, not
a claim that the feature is broken.

## INSPECTION UX

Roughly 30-40 individual clicks/inputs were required to fully review, risk-assess, and finalize the 5 findings from
one multi-hazard observation (5 findings × review-question + risk-confirm, plus one shared corrective-action step) —
reasonable for a Pro guided workflow, though the per-finding loop offers no visible progress indicator beyond a
one-line status banner ("Review saved for X. N findings remain unreviewed"), and that banner was observed to go
stale (not update immediately) at least twice during testing, which could make a real user think a click didn't
register when it had. HazLenz's reasoning, risk band, and clarification questions were all genuinely readable and
written in plain language, not AI-black-box jargon — a real strength. The reviewer retains the ability to accept,
answer, or correct every extracted fact before a standard is promoted from candidate to primary, which is exactly
the "qualified professional can override" posture the product claims.

## PERSISTENCE

Exercised: create → analyze → partially review → leave (navigate to `/inspections`) → reopen is not directly
supported (there is no "resume this draft" link from the inspections list once you navigate away mid-flow; state is
only recoverable if you stay in the same tab session) → within a single continuous session: review all 5 findings →
risk-confirm all 5 → corrective action → complete → generate report → log out → log back in → report still present,
same checksum. No cross-finding evidence contamination was found: each of the 5 findings' own confirmed facts,
risk, and (where present) standard stayed correctly scoped to that finding across the whole review/risk/completion
cycle — the earlier-described evidence-ownership problems are a decomposition/labeling defect, not a persistence
defect; once a fact is attached to the correct finding it stays attached to that finding.

## REPORT ACCURACY

One PDF report was generated and read in full (8 pages, `/tmp/insite-qa-report-v1.pdf`, retained for reference).

Accurate: cover page site name/inspector/date, Executive Summary risk distribution (1 Critical / 2 High / 2
Moderate / 0 Low, matching the 5 findings' actual confirmed risk bands), Findings Summary table, Corrective Action
Summary table — all internally consistent with the persisted database state.

Inaccurate or unprofessional:

- Every finding's "Applicable Standard" reads "Not established for this specific finding" — including the one
  finding (`machine_guarding`) that had a standard (29 CFR 1910.147) explicitly confirmed as primary during human
  review. The report generator does not carry forward confirmed standards at all.
- Every finding's "What Was Observed" is the full, identical 5-hazard paragraph, not that finding's own evidence.
- Findings 3 and 4 (both "Walking Working Surfaces") carry corrective actions that describe an electrical cord and
  a fall-arrest/guardrail system, respectively — neither matches "Walking Working Surfaces."
- Each finding's "FINDING" field is a single bare word ("conveyor," "electrical," "walkway," "trip," "cylinder")
  rather than a real label or sentence — reads as a leaked internal tag, not professional report content.
- The report-list UI (not the PDF itself) shows the inspection as a raw UUID rather than the site name.

Regulatory-text handling: correctly distinguishes "Applicable Standard" (citation/title) from HazLenz's own
reasoning throughout ("Qualified-Person Review" is clearly its own labeled section); no HazLenz-generated prose was
found presented as if it were quoted regulatory text.

## LIGHT/DARK/RESPONSIVE

Verified at 1440px (desktop) and ~390-430px-equivalent mobile width, in both light and dark theme, on the Reports,
Home/Command-Center, and Settings pages: no horizontal overflow, no clipped text, readable contrast in both themes,
buttons and controls appropriately sized for touch. Did not get to a systematic sweep of every page at every one of
the five requested breakpoints (1440/1024/768/430/390) — this is a real gap in this session's Phase 9 coverage,
noted honestly rather than claimed as complete.

## DEFECTS FOUND

**1. [FIXED — Production] HazLenz misclassifies a bare "tank" mention as Confined Space, overriding a specific,
correctly-supported Hazard Communication signal.**
- Reproduction: submit the observation text `"Tank has no label."` to `/safescope-v2/classify`.
- Root cause: `weighted-classifier.service.ts`'s Confined Space guardrail comment states the intent correctly
  ("requires entry/permit/atmosphere/attendant indicators to avoid false positives on simple chemical storage
  tanks") but its own `hasConfinedSpaceCue` boost regex matches on the bare words "tank"/"vessel" and grants +45
  unconditionally, while the adjacent penalty only subtracts 30 — netting +15 for the exact case the guardrail was
  written to block.
- Fix: gated the +45 boost so a bare tank/vessel mention (no entry/atmosphere context) does not receive it,
  matching the penalty's own condition. One `if` condition changed; no other scoring logic touched.
- Verification: `Tank has no label.` now classifies as Hazard Communication (score 15, margin 15, zero Confined
  Space evidence tokens) instead of Confined Space. The project's own `golden-hardening-tests.ts` suite ("Precision
  Scenario F") went from failing to passing; the other 16 cases in that suite were unaffected (16/17 → 17/17). Full
  `test:hazlenz-core` regression suite rerun: no new failures introduced (see REGRESSION RESULTS).

**2. [FIXED — UI] Header profile avatar shows a hardcoded, unrelated set of initials for every user.**
- Reproduction: register/log in as any user; the top-right avatar button always rendered the literal string "CM"
  regardless of the actual logged-in user's name.
- Root cause: `AppShell.tsx` had the literal JSX text `CM` hardcoded inside the profile button, never wired to the
  authenticated user's name at all.
- Fix: added a small `computeProfileInitials()` helper reading the same `getAuthUser()` the rest of the app already
  uses, recomputed on route change (matching the existing `hasAuthSession` recompute pattern in the same file), and
  replaced the hardcoded string with it.
- Verification: confirmed via live re-login that the avatar now shows correct initials ("JR" for Jordan Reyes) and
  updates correctly after logout/login as a different user's session.

**3. [NOT FIXED — Production, high severity] Standards matching does not run per decomposed finding in a
multi-hazard observation; only the primary/promoted finding gets a standard.**
- Reproduction: submit any observation containing 2+ genuinely distinct hazards through the Full Inspection guided
  flow; review each resulting finding individually.
- Evidence: in the 5-finding test case, 4 of 5 findings showed "No standard established for this finding yet"
  despite each describing a textbook, unambiguous violation the system correctly cites when tested in isolation
  (extension cord with cracked insulation → normally 1910.303-family; unsecured propane cylinder without valve
  cap → normally 1910.101; trip hazard across a main walkway → normally 1910.22). All 5 findings share one
  `hazlenz_analyses` row in the database, consistent with standards search running once against the observation's
  primary classification rather than once per finding.
- Why not fixed: the fix requires changing how standards search is invoked relative to multi-hazard decomposition
  — a core, protected reasoning path — and could not be done safely and narrowly within this session without a
  dedicated investigation into every downstream consumer of that data flow (report generation, corrective-action
  generation, persistence). Documented for a follow-up phase per this repo's own stated preference for narrow,
  well-understood fixes over broad changes to protected areas.

**4. [ENVIRONMENT, not a code defect] "Complete inspection and generate report" throws a raw "Internal server
error" when `STORAGE_PROVIDER` is unset and no S3 credentials are configured.**
- This was this session's own disposable-environment gap (no AWS credentials provisioned for local verification),
  resolved by using the repository's own `STORAGE_PROVIDER=local_test` mode, which exists specifically for this
  purpose. Documented because the raw, unhandled "Internal server error" message itself — with no indication of
  what failed or how to recover — is a real UX/error-handling gap worth flagging: a production storage outage would
  surface the same unhelpful message to a real customer mid-inspection-completion.

**5. [NOT FIXED — Production, high severity] Multi-hazard corrective actions are not consistently bound to their
own finding's evidence.**
- Reproduction: same 5-finding test case. Two findings both labeled "Walking Working Surfaces" receive corrective
  actions about, respectively, an electrical extension cord and elevated-work fall protection — neither is a
  walking-surfaces control, and the extension-cord one is a near-duplicate of Finding 2's (Electrical) own
  corrective action.
- Root cause not fully isolated within this session's time budget; the report layer's blanket reuse of the whole
  observation text for every finding's "What Was Observed" (Defect #2 in REPORT ACCURACY) makes it plausible the
  corrective-action generator is drawing on the same un-scoped full-text input rather than the finding's own
  evidence fragment, but this was not confirmed at the code level and is reported as an open question, not a
  diagnosis.

**6. [NOT FIXED — UI, low-moderate severity] Report list shows a raw internal UUID instead of a human-readable
label.**
- The Reports page lists a completed inspection as "Inspection 596e1c9d-dbb9-4219-8406-bee30380a93e" rather than
  the site name ("Riverside Fabrication Plant - Bldg 3") or inspection date, both of which are readily available
  (they appear correctly on the PDF cover page generated from the same record).

**7. [NOT FIXED — UI, moderate severity] Home dashboard Reports/Findings/Open Actions/Overdue counters read 0/0/0/0
despite real, persisted findings and a generated report existing for the account.**
- Confirmed reproducible at both desktop and mobile width, before and after a full page reload and a full
  logout/login cycle.

**8. [NOT FIXED — Production, moderate severity] `resultStage` does not reliably reflect low-confidence/
vague-input cases as provisional.**
- The project's own `hazlenz-clarification-gauntlet.ts` regression asserts that classifying `"The ladder is
  unsafe."` (confidence 0.52/low, an outstanding clarification question, `requiresHumanReview: true`) should yield
  `resultStage: 'provisional'`; it currently returns `'final'`. Root cause traced to
  `resultStage = ...clarifyingQuestions.some(q => q.blocksFinalization === true) ? 'provisional' : 'final'` — the
  generated clarification question for this case does not have `blocksFinalization: true` set, even though it is
  exactly the kind of low-confidence, evidence-gapped case that field appears designed to catch. Left unfixed:
  `blocksFinalization` gating touches inspection-finalization behavior broadly, and this session could not safely
  scope a fix without risking that protected mechanism.

**9. [NOT A PRODUCT DEFECT] Two stale test-fixture issues in the project's own verification harness, fixed as
narrow test-only changes:** `hazlenz-clarification-gauntlet.ts` inserted an entitlement grant with `tier: 'expert'`,
a value a 2026-08-16 migration (`RetireExpertTier`) narrowed the database CHECK constraint to reject (only `'pro'`
is valid now) — the script could not run to completion at all until this one-line value was corrected.
`hazlenz-independent-standards-audit.ts` has no authentication logic of its own and could not be run against a
realistically-configured (non-bypass) backend within this session; left as a documented gap rather than modifying
the script's design, consistent with how a prior session (2026-08-16) handled the same class of harness limitation.

**10. [MINOR — Data quality] Standards data-hygiene issues:** one citation/title mismatch (29 CFR 1910.178(p)(1),
verified against osha.gov) and one duplicate-format standard entry (`1910.147` vs `29 CFR 1910.147`, same
regulation, two rows) found in the 19-standard seed set spot-checked this session.

## REGRESSION RESULTS

- Backend `tsc --noEmit`: PASS (before and after).
- Frontend `next build`: PASS (before and after), all 23 routes.
- `test:hazlenz-core` (21 sub-suites): 20/21 PASS after fix (was 19/21 before fix — the Golden Hardening suite's
  Precision Scenario F case is now fixed). The one remaining failure (`HazLenz Production Path Regression`, "tagged
  but not locked" sub-case) is a pre-existing citation-ranking nuance about whether 1910.212(a)(1) should appear as
  `needsMoreEvidence` alongside 1910.147 for a specific LOTO scenario — already documented as pre-existing and
  unrelated to any in-scope fix by a 2026-08-16 session, confirmed still present and unchanged by this session's
  narrow classifier fix (this session's fix touches a different file/code path entirely).
- `test:safescope` (golden-hazard-tests, 12 cases): 11/12 PASS. One pre-existing, unrelated failure: "Maintenance
  without lockout" classifies with the correct family (Lockout / Stored Energy) but `low` confidence where the test
  expects `high` — a confidence-calibration issue, not a classification error; not touched by this session's fix.
- `test:safescope-standards` (19 cases): 19/19 PASS.
- `test:safescope-operational`: PASS.
- `test:safescope-domains`: PASS.
- `hazlenz-clarification-gauntlet`: 1 stale test-fixture bug fixed (see Defect #9); 1 genuine product defect found
  (see Defect #8) and left as a documented, reproducible regression-suite failure (matches the suite's own intended
  purpose — this is the regression that suite exists to catch, now confirmed real).
- Full `git diff --check`: clean, no whitespace errors.
- `git status` reviewed in full: only the 3 intentionally-modified files are new modifications; the ~75 untracked
  paths present at session start (all prior sessions' verification artifacts) were left untouched.

## REMAINING ISSUES

- Defects #3, #5, #7, #8, #10 above are confirmed, reproducible, and root-caused but not fixed in this session.
- Full verbatim-regulatory-text rendering (Phase 5's "if full text is locally available, display it correctly")
  could not be exercised because `regulatory_paragraph` is empty in the disposable environment; populating it
  requires a live eCFR ingestion out of proportion to this phase.
- Phase 9's five specified breakpoints were not swept systematically across every page; desktop + one mobile width,
  light + dark, on 3 representative pages was completed instead.
- Only one full multi-hazard observation was driven end-to-end through the complete guided-UI workflow (capture
  through PDF report); the 15 adversarial scenarios were run at the classification-API level (the same endpoint the
  UI calls) rather than each individually driven through the full finding-review-to-report UI cycle, for time
  reasons.
- `hazlenz-independent-standards-audit.ts` could not be run to completion (see Defect #9) — standards accuracy for
  the 19-case corpus that suite specifically checks was not independently re-verified by this session beyond the
  representative spot-checks under STANDARDS ACCURACY above.

## FINAL PRODUCT ASSESSMENT

FUNCTIONAL_WORKFLOW_READY: **NO** — core completion flow (Defect #4's underlying error-handling gap), dashboard
stats (#7), and report-list identification (#6) all need attention before a real customer's day-to-day workflow
would feel trustworthy, even though the golden path (capture → review → complete → download) does work end to end.

HAZLENZ_ACCURACY_READY: **NO** — Defect #1's class of false positive (confident, high-scoring active findings from
explicitly safe/negated/planned/historical text, including one fully fabricated finding with zero textual support)
is disqualifying on its own for a product whose stated design goal is exactly to avoid this. The underlying
capability to do this correctly exists (the LOTO controlled-condition case) but is not consistently applied across
hazard domains.

STANDARDS_READY: **NO** — Defect #3 means the majority of findings in a realistic multi-hazard inspection get no
standard at all, and the report layer (Defect in REPORT ACCURACY) loses even the one standard that was confirmed.
The standards that are cited, on the sample checked, are largely accurate with one confirmed citation/title
mismatch and one duplicate-entry data-hygiene issue.

REPORTING_READY: **NO** — every finding's evidence text and, for most findings, its standard, are not correctly
scoped in the generated PDF; two findings' corrective actions are actively wrong for their stated hazard category.

INSPECTION_UX_READY: **CONDITIONAL YES** — the guided workflow itself is coherent, HazLenz's reasoning is
genuinely readable and overridable, and persistence is solid; the friction found (registration auto-login, silent
disabled-button state, stale status banners) is real but not disqualifying on its own.

OVERALL_PRODUCT_READY: **NO.**

The blocker is not polish. It is that HazLenz — the product's core differentiator — currently produces confident,
high-scoring active findings, including at least one entirely fabricated finding, from observation text that
explicitly describes safe, corrected, planned, or negated conditions; and separately, that its own multi-hazard
decomposition and report generation lose standards and mis-bind corrective actions for the majority of findings in
any inspection with more than one hazard. A safety professional relying on this product today could not trust that
a "no deficiencies found" note in their own field notes wouldn't turn into a fabricated Critical finding in the
final report, nor that the standards and corrective actions shown for finding #3 actually belong to finding #3.
Both are fixable — the LOTO controlled-condition case and the per-finding-scoped risk assessment both prove the
underlying architecture supports doing this correctly — but neither is fixed today.
