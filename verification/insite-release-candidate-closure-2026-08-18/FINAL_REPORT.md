# InSite release-candidate closure — final report refinement + HazLenz capability truth audit

Date: 2026-08-18. Baseline `97941ca2`. Nothing committed, pushed, deployed, reset, reverted or stashed.

Environment (unchanged, not torn down): backend `:4010` (ts-node, restarted twice — once after the reports
change, once after the inspection-service fix), frontend `:3010`, disposable PostgreSQL
`insite_full_qa_20260818`. The original `safescope` database was never a migration/seed/mutation target and was
re-verified untouched at the end of the pass.

---

## Root causes established

1. **Executive Summary imbalance.** The page was a vertical stack of a two-column metric table, a full-width bar
   list and a short paragraph, ending around 55% down the sheet. Nothing shared a grid, so nothing aligned and
   the page read as an application screenshot.
2. **Duplicative Inspection Information page.** Five of its six rows (site, inspection, date, inspector, status)
   were already on the cover or in the Executive Summary metrics. Only *regulatory context* was unique.
3. **Finding page breaks.** The renderer is pdfkit, which paginates only on overflow. `ensureSpace()` was called
   with fixed guesses (30/40 points) that did not reflect the real height of the block about to be drawn, so a
   heading was emitted, then the content overflowed to the next page — reproduced on page 4 of the baseline
   Construction report ("RECOMMENDED CORRECTIVE ACTION" alone at the foot).
4. **Multi-hazard persistence blocker (found while generating the long multi-finding report).**
   `stableHazardKey()` derives a finding's key from the hazard *domain* alone. When one observation decomposes
   into several hazards of the same domain (routine: two excavation defects, two electrical defects), they all
   produced the same key and collided on `inspection_findings (observationId, segmentKey, revision)`. The
   `QueryFailedError` rolled back the whole `addAnalysis` transaction, so the analysis could not be saved at all,
   and the catch block reported it to the user as *"A newer analysis request already exists."* Proven directly
   against the disposable database (`duplicate key value violates unique constraint
   uq_inspection_finding_segment_revision`).
5. **Assignee never printed.** Corrective actions store `assignedToUserId`; `assignedToName` is only populated
   when a reviewer typed a free-text name. The snapshot never resolved the id, so the Owner column read
   "Unassigned" even when a real user was accountable.

---

## Files changed in this pass

| File | Change |
|---|---|
| `backend/src/reports/canonical-report-pdf-renderer.ts` | Executive Summary rebuilt on one symmetric grid; `Inspection Information` page removed; measured `Block` layout model with controlled page breaks, continuation headers and word-boundary text flow; `Risk:  <Level>` inline presentation; `Assigned To:` line; per-finding Notes area; cover blocks stacked from measured heights; trailing advisory folded into the Executive Summary's "Basis and Limitations" note |
| `backend/src/reports/canonical-reports.service.ts` | Snapshot resolves corrective-action assignee names from `assignedToUserId` (display only; the stored action row is never written) |
| `backend/src/inspection/inspection.service.ts` | `uniqueHazardKey()` — repeats of a hazard key within one analysis are suffixed by occurrence, so several same-domain hazards persist as several findings instead of failing the transaction |
| `verification/insite-release-candidate-closure-2026-08-18/` | New closure directory (this report, `HAZLENZ_AI_CAPABILITY_TRUTH.md`, four generated PDFs, capability harness + raw results + scores, regression logs, layout checker) |

Untracked verification-only helpers were also written under `backend/tmp/` (already an untracked directory):
`render-report-snapshots.ts`, `make-stress-snapshot.ts`, `check-report-layout.py`, `snapshots/`, `report-out/`.
No other tracked file was touched; all pre-existing uncommitted work in the tree was preserved.

SHA-256 of the three production files after the change is recorded in `changed-files-sha256.txt`;
`git diff --stat` for them is 878 insertions / 163 deletions (this includes pre-existing uncommitted work in
`inspection.service.ts`, of which this pass contributes ~25 lines).

---

## A — Report refinement: what changed behaviourally

1. **Executive Summary** — four equal stat tiles (Findings / Critical-High / Open Actions / Status) over two
   equal-width, equal-height panels (Risk Distribution | Inspection Record) over a full-width Assessment panel
   and a full-width Basis and Limitations note. Every element spans margin to margin, so all vertical edges
   align. The Assessment paragraph is now composed from the snapshot's own counts (band breakdown, action
   counts, unrated findings) instead of one canned sentence. Long site/inspector names are clamped to one line
   with an ellipsis inside fixed-height rows, so the panel cannot be pushed out or overrun.
2. **Inspection Information page removed.** Regulatory context moved into the Inspection Record panel (short
   regime label) with its provenance sentence in the Basis note. Report flow is now
   Cover → Executive Summary → Findings Summary → Detailed Findings → Corrective Action Summary.
3. **Page-break integrity.** Each part of a finding is a `Block` that measures its own height with the same
   font/size/width/lineGap it will draw with, and the writer decides the break. A heading must fit together with
   its first block. Label+value pairs, the risk band and its severity/likelihood breakdown, the citation and its
   title, and the assignment line plus the notes area are single atoms. Long prose splits at a word boundary and
   continues under a `Finding N — Hazard (continued)` header. Verified against a deliberately long finding
   (~10 000 characters of observation, standard summary and action steps) and a 13-finding inspection.
4. **Risk presentation** — `Risk:    High` with the canonical band to the right of the colon in the band colour,
   and the severity/likelihood/score line retained beneath it (standard safety terminology, not internal debug
   language). The coloured uppercase badge was removed.
5. **Assigned To** — prints the real assignee when the finding's corrective action has one (now resolved from
   `assignedToUserId`), otherwise a blank writing rule. No new assignment data model was created.
6. **Notes** — three ruled writing lines per finding, kept with their finding wherever the page allows.

### A7 — report verification actually performed

Four reports generated through the **real product path** (`POST /inspections/:id/reports` → storage →
`GET .../download`), not from hand-written snapshots:

| Report | Regime | Pages | Findings |
|---|---|---|---|
| `reports/osha-general-industry.pdf` | 29 CFR 1910 | 6 | 2 |
| `reports/osha-construction.pdf` | 29 CFR 1926 | 7 | 3 |
| `reports/msha.pdf` | 30 CFR | 6 | 2 |
| `reports/long-multi-finding.pdf` | 29 CFR 1926 | 15 | 13 |

The long one was driven end-to-end this session (create inspection → 4 long observations → classify → analysis
snapshot → per-finding human review → finalize → corrective action + task per finding → complete → generate),
mirroring the inspection-workspace flow including its per-finding corrective-action selection.

- **Every one of the 34 pages was inspected as a rendered image.** No clipping, no overlapping text, no truncated
  text, no awkward finding split, no orphan heading, no unnecessary blank page, no Inspection Information page.
- A geometric checker (`check-report-layout.py`, uses `pdftotext -bbox` so it works in page coordinates) was run
  over all four reports **and** five stress fixtures (single >1-page finding, 13-finding, zero-finding,
  pathologically long identity strings, many-findings): **all OK**. It found three real defects during
  development that were fixed: cover text running to the paper edge and colliding with the line beneath it when
  the site name is long; the risk band separated from its severity/likelihood line; the assignment line
  separated from the notes area.
- Standards remain corpus-backed, regulatory context/provenance correct (HazLenz-inferred jurisdiction is
  explicitly labelled), and corrective actions are finding-specific with the Owner column now populated.

---

## B/C — HazLenz capability truth

Full audit: **`HAZLENZ_AI_CAPABILITY_TRUTH.md`** (this directory). Summary:

- **Is it AI?** Yes, as knowledge-based/symbolic AI. There is **no trained model, no LLM, no embeddings, no ML
  runtime** anywhere — verified by dependency and source-wide search. Accurate label: `HYBRID_SYMBOLIC_AI`
  (weighted hazard-signal taxonomy + rule/predicate engine + TF-IDF retrieval + deterministic risk matrix +
  corpus-backed applicability, with provenance and uncertainty). Every decision-bearing mechanism is
  deterministic; the only statistical component is TF-IDF similarity.
- **Does it learn?** **No — `STATIC_RUNTIME_WITH_ENGINEERING_UPDATES`.** The learning services are either not
  registered in the module or are pure functions; at the production call site `standardsFeedback` and
  `correctiveActionOutcomes` are not passed, `supervisorValidations` is hard-coded empty, and `priorFindings` is
  never sent by the canonical client. The feedback table is written but never read by the reasoning path. This
  independently reproduces the previous closure's `LEARNING_ARCHITECTURE.md`, whose governed learning design is
  entirely FUTURE.
- **Does it reason contextually?** Yes, demonstrably — 5/5 adversarial pairs changed conclusion materially with
  shared vocabulary, and no controlled variant produced a SUPPORTED citation; identical fall wording produced
  `1910.28` under General Industry and `1926.501` under Construction.
- **Per-dimension scores** (64 live classify calls, never collapsed into one number): HAZARD_IDENTIFICATION 1.00,
  ADVERSARIAL_SEPARATION 1.00, JURISDICTION 1.00, STANDARD_PRECISION 1.00, CORRECTIVE_ACTION_RELEVANCE 1.00,
  EXPLANATION_QUALITY 1.00, CLARIFICATION_QUALITY 0.95, RISK_COHERENCE 0.89, NO_UNSUPPORTED_PROMOTION 0.91,
  MULTI_HAZARD_SEPARATION 0.80, UNCERTAINTY 0.80, CONTROL_STATE 0.75, OVERALL_CONTEXTUAL_COHERENCE 0.74,
  STANDARD_RECALL 0.65.
- **Standards gate preserved:** adjudicated gold set re-run after every change — precision 1.00 (24/24),
  recall 1.00 (24/24), wrong-regime 0, false-positive 0, correct no-match 7/7. No expectation was changed to
  make anything pass.
- **Newly found capability gaps** (12, each classified ENGINE_DEFECT / CORPUS_GAP / APPLICABILITY_AMBIGUITY /
  SUPPORTED_BEHAVIOR in §7 of the truth document): notably a bypassed interlock read as `Controlled`,
  contradictory lockout evidence producing nothing at all, a resolved-yesterday trench still cited, a blocked
  exit marked `CONTRADICTED`/`Controlled`, all-clear observations still emitting hazards, and ~35% of natural
  field scenarios receiving no candidate standard (corpus coverage).

### Customer-facing claims

No claim anywhere states or implies HazLenz learns from customer inspections — there is no "continuously
learns", "gets smarter", "improves from your inspections" or "trained on" copy in the product. **No marketing
copy had to be changed in this pass.** Two claims are flagged **OVERSTATED** for the owner's decision (they are
about tailoring and insight, not learning):

- HazLenz page: "Recommends **custom**, layered action plans … **tailored to the hazard mechanism**" — true for
  mapped families, generic template otherwise.
- Pricing (Pro): "Repeat-hazard insight support" — defensible only as reporting over stored findings, never as
  cross-inspection learning.

Defensible description, backed by the architecture:

> HazLenz is an AI-assisted safety reasoning system that evaluates inspection evidence in context, separates
> distinct hazards, considers controls and regulatory context, identifies applicable standards, evaluates risk,
> and explains its assessment while preserving uncertainty when evidence is incomplete. It is a governed,
> deterministic engine: it does not learn from your inspections, and every conclusion is advisory and requires
> qualified human review.

---

## D — Verification actually executed

| Check | Result |
|---|---|
| Backend `tsc --noEmit` | clean |
| Backend `npm run build` | clean |
| Frontend `npx tsc --noEmit` | clean (0 lines of output) |
| Frontend `npm run build` | Compiled successfully |
| `git diff --check` | clean (exit 0) |
| `npm run test:hazlenz-core` | **27 suites pass, 2 fail — byte-identical to the frozen baseline log** (Golden Hardening Scenarios, Production Path "tagged but not locked"). Both pre-existing and documented in the previous closure; neither introduced nor suppressed here |
| `npm run test:safescope` | 11 passed / 1 failed — same pre-existing case as baseline |
| `test:safescope-standards` | **15 passed / 0 failed** against the provisioned corpus |
| `test:safescope-domains` | pass |
| `test:safescope-operational` | pass |
| `test:standards-corpus-integrity` | all invariants passed, 0 failed (26-row corpus) |
| Adjudicated standards gold set | precision 1.00, recall 1.00, wrong-regime 0, false-positive 0 |
| Capability harness | 64 live classify calls; per-dimension scores and every individual failure in `capability-harness/capability-scores.json` |
| Report layout checker | 4 real reports + 5 stress fixtures, all OK |
| Report visual inspection | all 34 pages of the four real reports viewed as images |

**Environment caveat worth recording:** `test:safescope-standards` and `test:standards-corpus-integrity` read
`DATABASE_URL`. Run with the repository default they point at the original `safescope` development database,
whose `standards_master` table is **empty (0 rows)** — producing 12/15 and 1 failure respectively. Against the
provisioned corpus (`insite_full_qa_20260818`, 26 rows) both pass fully. This is a **provisioning** fact, not a
code defect, but it means these suites are only meaningful when pointed at a database whose standards corpus has
been synced.

---

## Repository / worktree state

- Nothing committed, pushed, deployed, or sent to any remote. No branch created or modified.
- **Original `safescope` database untouched** — re-verified after all work: 0 `regulatoryContext` columns on
  `inspection` (the migration was never applied there), and it was never a migration/seed/mutation target. Only
  read-only queries touched it (the two suites above, unintentionally, via the default `DATABASE_URL`).
- **Four pre-existing stashes untouched** — `git stash list` returns the same four entries, unchanged.
- No `git reset`, `git checkout --`, `git restore`, `git stash` or `git clean` was run at any point.
- All pre-existing uncommitted work in the tree was preserved; only the three production files listed above
  were modified.

## Remaining known limitations

1. The four control/contradiction/temporal engine defects in §7 of the truth document (bypassed guard, conflicting
   evidence, temporal resolution, blocked exit). They fail *safe* — under-calling, never fabricating a violation —
   but they are the highest-value backlog and should be fixed before control-state reasoning is marketed as a
   capability.
2. Corpus coverage: ~35% of natural field observations receive no candidate standard.
3. Multi-hazard separation quality (both under-separation and same-clause over-splitting); on long observations a
   finding can receive the whole observation as its fragment and then follow the wrong hazard's standard.
4. Two pre-existing `test:hazlenz-core` suite failures, unchanged from baseline.
5. `addAnalysis` still converts any `QueryFailedError` into "A newer analysis request already exists.", which
   masked defect #4 above. Left as-is (out of scope for this pass) but worth correcting.

## Broader verification still required

None for this pass. Before commit, the diff-integrity review of the three changed files is the next step.

---

# **READY_FOR_DIFF_INTEGRITY_AND_COMMIT**

- Report: **REPORT_READY**
- HazLenz capability: **HAZLENZ_CAPABILITY_VERIFIED** (with the scope and gaps stated in
  `HAZLENZ_AI_CAPABILITY_TRUTH.md`)
