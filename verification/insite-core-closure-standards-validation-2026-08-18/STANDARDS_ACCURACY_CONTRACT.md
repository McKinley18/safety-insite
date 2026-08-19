# InSite Standards Accuracy Contract

This document defines the exact contract every standard InSite displays to a customer must satisfy. It is written
against this repository's actual architecture (traced and verified in this session and the prior remediation
session) so it can be used mechanically to score every subsequent standards test in this phase, not as an abstract
aspiration.

For every displayed standard, ALL of the following must independently be true. A standard that fails ANY one of
these is not release-ready, regardless of how many of the others it satisfies.

## 1. Finding relevance

The standard must be the output of an evaluation run against **that specific decomposed finding's own evidence**
(`hazard.observationFragment` + `mechanism` + `supportingSignals`), not the parent observation's combined text and
not the primary/whole-observation classification.

- **Mechanism in this codebase:** `applyFindingScopedStandards()` in
  `backend/src/safescope-v2/evidence/evidence-foundation.ts`, which calls `buildEvidenceFacts()` + `evaluate()`
  once per decomposed hazard, writing the result to `hazard.standardCandidates`.
- **Pass condition:** `hazard.standardCandidates` is present (even if empty) for every decomposed hazard, and its
  contents trace only to that hazard's own fields.

## 2. Jurisdiction relevance

The standard must belong to the regulatory regime and industry context actually established for the observation
(OSHA General Industry, OSHA Construction, MSHA, or another supported regime). General Industry and Construction
must not be silently interchanged, and MSHA must not be offered for a clearly non-mining context or vice versa,
without evidence in the observation/finding establishing that jurisdiction.

- **Mechanism in this codebase:** `buildEvidenceFacts()`'s `jurisdiction` fact (derived from `scopes`/
  `structuredObservation.jurisdiction`), consumed by `evaluate()`'s `mine`/`gi`/`construction` gates before any
  citation is even considered.
- **Pass condition:** every returned citation's regime (30 CFR = MSHA; 29 CFR 1910 = OSHA General Industry; 29 CFR
  1926 = OSHA Construction) matches the finding's own established jurisdiction, not a jurisdiction inferred solely
  from generic hazard vocabulary that exists in multiple regimes.

## 3. Citation integrity

The displayed citation string must identify the exact regulatory provision intended — correct part, subpart,
section, and paragraph/subparagraph where a paragraph-level claim is made. Two different citation-string formats
for the same regulation (e.g. `"1910.147"` vs `"29 CFR 1910.147"`) must resolve to one canonical row, not two.

- **Mechanism in this codebase:** `standards_master.citation`, seeded via `safescope-standards.seed.ts` and
  `standards-intelligence.seed.ts`, reconciled by `sync-standards-intelligence-to-master.ts` (fixed this session to
  match on a normalized citation key).
- **Pass condition:** zero duplicate rows for the same regulation under different citation strings; the paragraph
  depth of the citation matches what the evidence actually supports (see Contract Point 10 / Phase 10).

## 4. Title integrity

The displayed title must correspond to that exact citation's actual regulatory heading — not a sibling paragraph's
heading, not a subpart-level generic label presented as if it were the specific paragraph's title.

- **Verified defect class (fixed this session's predecessor):** `29 CFR 1910.178(p)(1)` was titled "Powered
  industrial trucks - General requirements" (paragraph (a)'s actual title), when (p)(1) is specifically about
  taking a defective/unsafe truck out of service.
- **Pass condition:** for every sampled entry, the title independently read against osha.gov/eCFR names the same
  provision as the citation.

## 5. Text integrity

If InSite displays regulatory text as authoritative, it must match the authoritative source for that exact
provision verbatim (or via a disclosed, faithful paraphrase clearly labeled as such). It must never present
HazLenz's own generated summary, explanation, or reasoning in a manner that could be mistaken for verbatim
regulatory text.

- **Mechanism in this codebase:** `regulatory_paragraph` table (verbatim text, populated via eCFR ingestion —
  confirmed empty in this disposable environment, a coverage gap not a correctness defect) vs. `guidedFinding.
  primaryStandard.simplifiedRequirement`/`whyOffered` (HazLenz's own generated language, in
  `display/guided-finding-response.ts`).
- **Pass condition:** the UI and report visually and structurally separate "authoritative text" from "HazLenz
  explanation" at all times, and state plainly when authoritative text is not locally available rather than
  substituting generated prose into that slot.

## 6. Applicability

The regulation must actually govern the facts the finding describes. A citation can be textually valid and still
be the wrong match if the finding's facts do not satisfy that provision's own applicability conditions (e.g., a
general "walking-working surfaces" citation offered for a condition that is specifically a stairway-handrail
condition governed by a more specific provision).

- **Mechanism in this codebase:** `evaluate()`'s per-citation `predicates` array (e.g. MSHA jurisdiction + servicing
  activity + hazardous energy source, all required before `29 CFR 1910.147` is marked `SUPPORTED` rather than
  merely `UNKNOWN`/candidate).
- **Pass condition:** a citation is only shown as a direct/confirmed match when its own required predicates are
  actually supported by that finding's evidence; otherwise it is shown as a candidate requiring further evidence,
  never as confirmed.

## 7. Evidence ownership

The standard must be connected to evidence owned by the same finding it is displayed under — never another
finding's evidence, never the whole observation's combined text treated as if every word belonged to this finding.

- **Mechanism in this codebase:** `hazard.standardCandidates` computed from `hazard.observationFragment` alone
  (Contract Point 1's same mechanism); `inspection_findings.sourceCandidate.standardCandidates` persisted per
  finding row.
- **Pass condition:** verified this session with an automated regression
  (`hazlenz-finding-scoped-standards-regression.ts`) proving a LOTO finding's standard does not appear on a
  machine-guarding finding's candidate list and vice versa.

## 8. No fabricated authority

HazLenz summaries, explanations, paraphrases, reasoning, or any generated text must never be labeled or displayed
as if it were verbatim OSHA/MSHA regulatory text.

- **Pass condition:** confirmed in the prior session's UI walkthrough — the Standard Detail panel already
  separates "HazLenz Standard Summary" from the citation/title header and states when verbatim text is
  unavailable rather than fabricating it. This contract point requires that behavior be re-verified after this
  session's changes (Phase 13) and never regressed.

## 9. No leakage

A standard belonging to Finding A must never appear under Finding B in the UI, persisted database row, or PDF
report.

- **Pass condition:** verified across all three surfaces (DB → UI data path → PDF) for the same set of findings in
  one continuous check, not independently on unrelated test cases.

## 10. Traceability

For every standard InSite returns, it must be possible to state the chain: finding evidence → hazard family →
applicability reasoning (which predicates were checked and their status) → regulation (citation/title) →
authoritative source (where that regulation's text/title was verified). If any link in that chain cannot be
established, the match must be treated as unverified and must not be presented with unqualified confidence.

- **Pass condition:** every gold-set case adjudicated in Phase 8 records this full chain explicitly, and every
  representative validation reported in the FINAL_REPORT for this phase shows it end to end.

---

## Scoring rule for this phase

A standard is **release-ready** only if it satisfies all 10 points above. A standard satisfying some but not all
points (e.g., citation and title are correct, but applicability to this specific finding's facts is not
established) must be labeled a *candidate requiring further evidence*, not a confirmed match — this is a
legitimate, honest product state, not a failure, as long as it is presented as such rather than silently upgraded
to a confirmed citation.

`STANDARDS_READY: YES` is not permitted in the final assessment unless every standard sampled and every standard
in the representative gold set either fully satisfies this contract or is honestly labeled as an unverified
candidate rather than a confirmed regulatory match.
