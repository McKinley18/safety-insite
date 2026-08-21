# KG-3F Phases 14–16 — family readiness, Standard Detail, customer-path disconnection

---

## Phase 14 — hazard-family cutover readiness

`npm run report:kg3f-family-readiness <releaseId>` → `family-readiness.json`

**27 families measured across 31 gold-set scenarios.** Families are derived from the gold-set
`area`, not from a hand-maintained citation→family table: such a table has to be updated every time
a predicate changes which citation it emits, and it silently misattributes otherwise — which is
exactly what happened to 56.14132 in KG-3E.

| readiness | families |
|---|---|
| `READY` | 25 |
| `READY_WITH_APPLICABILITY_UNCERTAINTY` | 2 — `traffic control`, `fall protection (scaffold)` |
| `READY_WITH_EVIDENCE_UNKNOWN` | 0 |
| `BLOCKED_GOVERNANCE_GAP` | **0** |

**Hard readiness target — no important measured family becomes functionally blind because
governance filtering removed its only defensible candidate: MET.**

### `EVIDENCE_UNKNOWN` vs `GOVERNANCE_FILTER_EMPTY` — the distinction that governs cutover

An empty result has two causes that look identical in a coverage number and could not be more
different in meaning:

| outcome | meaning | blocks cutover? | measured |
|---|---|---|---|
| `EVIDENCE_UNKNOWN` | HazLenz produced **no candidate** because the observation does not establish the rule's applicability conditions. Governance was never involved — it had nothing to filter. This is the **correct** behavior and is precisely what Phases 5–7 built. | **No** | **0** |
| `GOVERNANCE_FILTER_EMPTY` | HazLenz **did** produce a defensible candidate and approved-only filtering removed it. A genuine corpus/governance gap. | **Yes** | **0** |

Reporting the first as a coverage failure would create pressure to re-weaken the predicate to make a
number go up. That is the failure mode this split exists to prevent.

Negative controls (7 cases) are excluded from the blindness arithmetic entirely: an empty result
there is the *asserted correct outcome*, and counting it as a gap would invert the test's meaning.

### A fourth readiness state was added, deliberately

`READY_WITH_APPLICABILITY_UNCERTAINTY` covers a family that is fully **covered** and still carries an
unestablished applicability predicate — MSHA-TRAFFIC-01 emits the truthful section-level 56.14132
while the obstructed-view trigger remains `UNKNOWN`. Collapsing that into plain `READY` would assert
that every applicability condition is satisfied, which is the exact claim Phase 15 requires Standard
Detail never to make. It is not a blocker; it is a **disclosure obligation**.

### A harness defect worth recording

The first run reported `EVIDENCE_UNKNOWN = 0` and `applicabilityUncertainFindings = 0` — the right
answer for the first, and a **vacuous** answer for the second. The decisions were being read from
`foundation.evidenceFoundation.standardDecisions`, which does not exist; the real surface is
`foundation.applicabilityDecisions`. The metric was measuring nothing. After the fix, uncertainty is
also read at the **predicate** level, not just the decision level — a decision can be emitted while a
required predicate is `UNKNOWN`, which is exactly the corrected 56.14132 shape, and reading only
decision status would have scored it as fully certain.

---

## Phase 15 — Standard Detail browser verification

`kg3f-standard-detail-contract.mjs`, real Chromium 148, **376/376 checks passed**, isolated
infrastructure (backend :4320, frontend :3320 from a scratch copy — the working tree's
`frontend-next` was never started against, so unrelated theme work stayed untouched).

### Five states, produced by the real engine

| # | scenario | citation | content axis | applicability axis |
|---|---|---|---|---|
| 1 | approved + high confidence | `29 CFR 1926.501` | `APPROVED_GOVERNED_CONTENT` | High / direct |
| 2+5 | **approved + uncertain applicability** | `30 CFR 56.14132` | `APPROVED_GOVERNED_CONTENT` | **Low / UNKNOWN** |
| 3 | unapproved + strong evidence | `29 CFR 1926.34(a)` | `UNAPPROVED_CONTENT` | Low |
| 4 | citation-only | `30 CFR 56.14132(b)(1)` | `CITATION_ONLY` | High / SUPPORTED |

**Scenarios 2 and 5 are the same cell**, and 56.14132 is the real instance of it. The first attempt
targeted `29 CFR 1926.451(g)(1)`, which the engine does produce as approved-with-candidate
applicability — but only ever as an *additional* standard, and the Standard Detail panel renders the
**primary**. That is correct product behavior, not a gap. The corrected 56.14132 is the same cell as
a primary, under strictly harder conditions: misreading the badge there means asserting an MSHA
violation.

**Scenario 4 is produced honestly, not by emptying a corpus record.** With rear visibility
established and no compliant alternative, HazLenz earns the exact paragraph `30 CFR 56.14132(b)(1)`.
The corpus holds the **section**. Under the KG-3E/3F structured citation comparison a paragraph does
not match its parent, so nothing backs the citation and the display correctly falls to
`CITATION_ONLY`. The citation is right; the corpus simply does not hold that paragraph yet.

### The central assertion

For the (approved content × uncertain applicability) cell, in **all four** of light / dark / mobile /
mobile-dark:

* the *"Verified standard text"* badge **is** present — a claim about the text;
* the applicability line still reads **Confidence: Low**;
* *"Why HazLenz selected this: Candidate only; missing: operator has an obstructed view to the rear."*;
* the evidence gap is disclosed under *"Details that would increase confidence"*;
* **no** "verified text is not currently available" notice — the `UNKNOWN` applicability result is
  **not** dressed as a corpus failure.

The two axes are independent and stay independent. Additionally asserted: the KG-3D contradiction
(badge and *"has not completed source review"* appearing together) does not occur; no internal
governance vocabulary reaches the page (16 forbidden terms, including the new `approvalDigest`,
`substantiveContentDigest`, `sourceIdentityDigest`); no horizontal overflow at 390px.

### Two harness defects found and fixed

1. **Substring citation matching.** `"30 CFR 56.14132"` is a prefix of `"30 CFR 56.14132(b)(1)"`, so
   searching the card text for the section found the **paragraph** card and verified the wrong
   state. This is the same parent/child collapse the KG-3E structured citation comparison exists to
   prevent, reappearing inside the test harness. Now matched exactly against the citation heading
   element.
2. **Flattened-text parsing.** `Confidence:\s*(.*)` over whitespace-collapsed `innerText` captured
   every following paragraph as part of the label, making every applicability assertion meaningless.
   Now read from the specific DOM nodes.

---

## Phase 16 — customer-path disconnection

`npm run test:kg3f-customer-path-disconnection` → **9/9**, reproduced on three independent
databases.

Static (source-tree) + data (database) rather than behavioral, so it cannot be defeated by a server
configured differently from production.

| check | result |
|---|---|
| `CP-1` no customer path imports a governed-knowledge module (5 trees: `safescope-v2`, `applicable-standards`, `inspection`, `reports`, `safescope`) | pass |
| `CP-2` candidate retrieval filters on no reviewer-approval column | pass |
| `CP-3` candidate retrieval reads no governed release table | pass |
| `CP-4` no analysis carries a **real** governed release id | pass |
| `CP-5` no finding claims governed-release provenance | pass |
| `CP-6` no **real** release is `active` | pass |
| `CP-7` no governed-retrieval feature flag is **read** from the customer path | pass |
| `CP-7b` `approved-knowledge-search`'s "approved" is unrelated to the regulatory corpus | pass |
| `CP-8` every importer of the governed resolver is a verification script or the governed subsystem | pass — 11 importers, **0** in customer `src/` |

**Why this is a test and not a paragraph.** Wiring the governed resolver into customer retrieval
would filter candidates down to reviewer-approved records. Today that would empty most hazard
families, so a customer would simply stop being told about hazards — with no error, no log line and
no visible defect. A grep in a markdown file does not catch that on the day it happens.

### Three guard refinements, each narrowing a check that fired on the wrong thing

* `CP-7` originally matched the bare token `APPROVED_ONLY` and flagged
  `approved-knowledge-search.types.ts`, where `'approved_only'` is a value in a **result-type union**
  (`sourceUsability`). A string literal in a type cannot enable retrieval; only a read of external
  configuration can. Now matched on an actual flag **read** (`process.env.*`, `config.get(...)`), and
  `CP-7b` asserts positively that the subsystem touches no governed table — so the exclusion cannot
  later hide a real wiring.
* `CP-4` and `CP-6` originally required *zero* release-stamped analyses and *zero* active releases.
  Verification suites create these on purpose: the KG-1 provenance suite writes
  `kg1-fixture-release.*` analyses, and `test:governed-corpus-matrix` activates `kg3b-matrix.A` to
  exercise the KG-2 gate. A bare zero-check therefore failed as soon as two suites shared a database
  — for a reason with nothing to do with the customer path. Both now exclude explicitly-named fixture
  releases, which makes them **sharper**, not weaker: a real cutover would stamp and activate
  `federal-core-*`, and that is still caught.

Broadening a guard until it fires on unrelated code does not make it stricter; it makes it
ignorable.
