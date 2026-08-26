# `KG5C-DISC-01` — DISCOVERY RESULT `ZERO COST, ZERO PRODUCTION ACCESS, ZERO MUTATION`

## The question being answered

**Why are 634 legacy `plain_language_summary` values cut mid-word, and what is required to close the
finding?**

| | |
|---|---|
| **Classification (authoritative, §26)** | `DEFECT_NONBLOCKING — CUSTOMER_VISIBLE_ON_GENERATED_REPORT` |
| **Owner** | **SOURCE** / the legacy content-generation path. Not RESOLUTION, not PRESENTATION. |
| **Release-gate impact** | **Blocks neither production SHADOW nor governed CUTOVER** — restated unchanged after the 2026-08-22 reclassification |
| **Condition for closure** | *"Either the generation path is corrected at SOURCE and re-measured, **or** a recorded adjudication accepts the truncation with a stated rationale."* |
| **Prohibited** | Remediation (§24: a non-blocking defect must not expand the release gate); production mutation; silently closing it because cutover masks it |

## Work performed — repository evidence and static inspection only

**No production access. No database query. No provider call. `$0.00`.**

### Root cause — located exactly

```
backend/src/standards/ingestion/ingest-ecfr-standards.ts:242
    entity.plainLanguageSummary = standardText.slice(0, 500);
```

A **hard 500-character slice of `standard_text` with no word, sentence or clause boundary
awareness.** This is the complete and sufficient explanation of the recorded finding: 996 of 2,390
production rows are exactly 500 characters, and 634 of those land mid-word. Nothing about the
mechanism is uncertain — a fixed-offset slice cuts wherever offset 500 happens to fall.

### A second, previously unrecorded generation site — NEW FINDING

```
backend/src/standards/maintenance/enrich-standards-master.ts:185
    if (!s.plainLanguageSummary || s.plainLanguageSummary.length < 10) {
      s.plainLanguageSummary = s.title.slice(0, 100);
    }
```

A **fallback** that fires only when a summary is missing or shorter than 10 characters. It is **not**
the cause of the 996 rows — those are 500-character cuts of `standard_text`, not 100-character cuts
of `title` — but it is **the same defect class**: a raw fixed-offset slice that will cut mid-word on
any title longer than 100 characters.

> **This site is recorded, not remediated.** It was not named in the original `KG5C-DISC-01` entry.
> **Any SOURCE correction must address both sites, or it will leave a second truncation path live.**

### What could NOT be established locally, and why

The 996/634 counts **cannot be reproduced from this repository**. The only local database backup,
`safescope-data/db-backups/safescope-before-ecfr-ingest-20260619-130514.sql`, is by its own name
**from before the eCFR ingest** and therefore does not contain the affected rows.

> **This does not weaken the finding.** The counts are already measured and recorded by KG-5C
> (`kg-5c/STATUS.md` §8, lines 251–254) with `kg-5c/contracts/customer-path-equivalence.json`, and
> the report-surface evidence is in `hazlenz-capability-acceptance-2026-08-22/STATUS.md` §9 (7
> generated PDFs inspected with poppler). **Re-measuring would require production read access, which
> is not needed to establish root cause and was therefore not requested.**

## Result — `PARTIAL`

**Root cause is fully established and both generation sites are located, at zero cost.** The finding
cannot be *closed* by this phase, because its own closure condition offers exactly two routes and
**neither is available here**:

1. **Correct the generation path at SOURCE and re-measure** — a production-source change plus
   re-measurement against production data. **Not authorized by this phase** (discovery and local
   analysis only), and §24 forbids a non-blocking defect expanding the release gate.
2. **Record an adjudication accepting the truncation with a stated rationale** — **a product
   decision belonging to the user**, not an engineering conclusion. This phase can supply the
   evidence for that decision and does so below; it must not make it.

## The adjudication the user must make — options and consequences, not a recommendation

| option | what it means | cost | consequence |
|---|---|---|---|
| **1. Accept with rationale** | Record that truncated legacy summaries are acceptable in `LEGACY` because governed cutover repairs them for approved records | `$0` | **Closes the finding.** But cutover repairs only **15 of 2,390** rows; the remaining Path B customers keep reading fragments on both the workspace surface **and** generated PDFs |
| **2. Correct at SOURCE** | Replace both fixed-offset slices with boundary-aware truncation, then re-ingest or backfill and re-measure | code + a production data operation, each needing its own authorization | **Closes the finding properly.** Fixes all 2,390 rows, not 15 |
| **3. Defer with a recorded date** | Explicitly defer past initial launch with an owner and a revisit trigger | `$0` | Keeps it open and visible; does **not** close it |

> **Option 2 is a deterministic, testable, `$0`-to-develop change** — boundary-aware truncation is
> Tier-0/Tier-1 work with no provider involvement — **but the re-measurement step touches production
> data and must be authorized separately.** I am not recommending an option: which of the three is
> right depends on whether truncated fragments are acceptable in the initial launch scope, which is
> a product judgement.

## What was NOT done

No production access of any kind. No database read, query or mutation. No migration. No code change.
No remediation. The finding is **not** marked closed. `$0.00`.
