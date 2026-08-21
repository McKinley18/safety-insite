# KG-4A — provenance, mixed provenance, release pinning, rollback (Phases 7, 8, 9, 14)

## 1. The rule, unrelaxed

> `knowledgeReleaseId` may become non-NULL **only** when the customer-visible analysis actually
> consumed governed release information.

KG-1 set this column to NULL unconditionally and was right to: retrieval did not consume governed
data, so any id would have been false. KG-4A does not relax the rule — it supplies the missing
evidence for it. Provenance is written only where `decideFallback()` returned
`governedProvenanceEligible`, which is true only where governed content changed what the customer sees.

| Mode | analysis `knowledgeReleaseId` |
|---|---|
| `LEGACY` | **NULL** |
| `SHADOW` | **NULL** — a background comparison is not consumption |
| `GOVERNED_*`, no release pinned | NULL |
| `GOVERNED_*`, pinned, **nothing consumed** | **NULL** — output identical to LEGACY; naming a release would be false |
| `GOVERNED_*`, pinned, something consumed | the pinned release |

Verified against the fallback table on **all 84 rows**.

## 2. The anti-spoofing gate — a flaw found and closed

`addAnalysis` receives `resultSnapshot` in the **request body**, and the customer paths stamp a
per-finding `knowledgeReleaseId` into it. Reading that back naively would let a client post an
invented release id and have it persisted as governed provenance — defeating the provenance contract
and violating KG-1's own rule that provenance is decided *"never from client input"*.

`resolveKnowledgeReleaseId(snapshot, principal)` therefore treats the snapshot as an untrusted
**claim** and honours it only when the **server** independently agrees that:

1. this principal is enabled for a mode that can influence customer output, **and**
2. the claimed release is the one actually `active` on this server right now.

Fail either and the answer is NULL. Tested directly, including through the real HTTP API:

* no governed mode configured + spoofed snapshot → NULL
* no governed mode configured + *truthful* claim → NULL (the mode decides)
* governed mode, **non**-allowlisted principal + spoofed snapshot → NULL
* governed mode, allowlisted principal, claimed release ≠ active release → NULL
* governed mode, allowlisted principal, claim matches the active release → recorded
* `SHADOW` + allowlisted + truthful claim → **NULL**
* two distinct releases in one snapshot → NULL (pinning violated)

## 3. Mixed provenance (Phase 8) — existing schema, no migration

The brief's scenario, measured end-to-end:

| finding | backing | analysis id | finding id |
|---|---|---|---|
| A approved governed content | `APPROVED_EXACT` | release | **release** |
| B fell back | `NOT_IN_RELEASE` | release | **NULL** |
| C citation-only | `APPROVED_NO_TEXT` | release | **release** |
| D applicability uncertain | `UNAPPROVED_RECORD` | release | **NULL** |

* The **analysis** is governed if **any** finding consumed — release content is materially present.
* A **finding** is governed only if **it** consumed.
* `mixed` is surfaced so a reader of the analysis row knows to look at the findings.
* Finding D's NULL comes from its **backing**, not its uncertainty: changing only applicability
  changes no provenance at all (asserted).
* Findings never disagree about **which** release — one analysis pins one release.
* KG-1's invariant holds by construction: `findingReleaseId()` can only return the analysis's own id
  or NULL, never a third value.

`hazlenz_analyses.knowledgeReleaseId` and `inspection_findings.knowledgeReleaseId` both already exist
from KG-1, so **no migration, no new column and no standard-level table** were introduced.

**Narrowing applies only where there is per-finding information to narrow by.** When a snapshot
carries no governed stamps (every legacy analysis, and the deterministic fixture
`test:knowledge-release-provenance` substitutes), the finding inherits verbatim exactly as KG-1
specified — and likewise when a hazard carries no candidate list of its own, since recording NULL
there would *understate*. This was found by KG-1's own suite failing, not by inspection.

## 4. Release pinning (Phase 9)

`getActiveRelease()` reads a mutable pointer; an analysis is not atomic. The pointer is therefore read
**once**, at analysis start, and every resolution takes the pinned id explicitly.

Preferred over holding a lock, which would serialise long AI operations behind a corpus pointer —
unnecessary, because `regulatory_release_records` is immutable once finalized, so pinning an **id** is
sufficient to make the snapshot stable.

**The race, tested against a real database:**

```
analysis pins R1 → resolves APPROVED_EXACT
  ↓ active pointer moves to R2 mid-analysis (verified moved)
analysis still resolves against R1, identical backing, identical content
a LATER independent analysis correctly picks up R2
```

Parallel analyses may pin the same release concurrently, and three concurrent pins each retain their
**own** mode — there is no request-global mutable state (no module cache, no `AsyncLocalStorage`, no
singleton).

## 5. Rollback (Phase 14)

Rollback is a **mode change**. It requires no database rollback, no release de-activation, no approval
revocation, no analysis rewriting and no corpus redeploy.

```
t0  governed  → analysis persists release R
t1  operator sets GOVERNED_CUTOVER_MODE=LEGACY (or clears the allowlist)
t2  the NEXT analysis records NULL
    the t0 analysis still records R — nothing recomputes a persisted row
```

`historicalProvenanceIsPreserved(before, after)` is plain equality in **both** directions, and the
suite asserts it genuinely fails if a historical id were cleared *or* if a legacy analysis acquired
one — so the check cannot pass vacuously.
