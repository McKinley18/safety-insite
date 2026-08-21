# KG-4A — report, browser, concurrency, tenancy, performance (Phases 15–19)

## Phase 15 — report contract

Driven through the **real product lifecycle**: classify → persist analysis → review each finding →
finalize each finding → transition the inspection to `completed` → generate the report. Anything
less would verify the report contract against a state no customer report is produced from.

Generated report's persisted `knowledgeProvenance`:

```json
{"findingCount":1,"knowledgeReleaseIds":["federal-core-2026-07-30.1"],"findingsWithoutKnowledgeRelease":0}
```

* names **at most one** release — pinning held through report generation;
* states **how many findings were NOT governed** rather than labelling the whole report governed;
* derived only from provenance persisted on the findings, never from whichever release is current at
  export time (KG-1 property, preserved — `test:knowledge-release-provenance` **27/27**, including
  *"Regenerating the report after the latest release changed does NOT adopt the newer release"* and
  *"Report remains valid with partially unversioned findings and reports them as unversioned"*).

The block lives in the report's persisted **source snapshot**, which is where KG-1 put it and where
rendering consumes it. The HTTP response does not surface it; **no API field was invented** to make
an assertion convenient — the row is read. **No report layout or copy was changed.**

## Phase 16 — browser contract

Real Chromium, isolated infrastructure (scratch copy of `frontend-next` + its own backend on 4331).
The working tree's `frontend-next` is never started against; its 18 modified files and `.next` cache
stay untouched — re-verified 18/18 by hash.

**240/240 checks**, 4 themes × 2 accounts. Screenshots: `browser/{governed,legacy}-{light,dark,mobile,mobile-dark}.png`.

The design is **comparative** — two accounts, same server, same database, same active release, one
allowlisted:

| Property | Result |
|---|---|
| non-allowlisted account shows **no** verified badge anywhere | ✔ all 4 themes |
| allowlisted account **does** show one (proof is not vacuous) | ✔ all 4 themes |
| same citation ⇒ **same applicability confidence** in both modes (`High` vs `High`) | ✔ all 4 themes |
| no card both shows verified text and says it is unavailable | ✔ |
| no verified text alongside the source-review caveat | ✔ |
| **22 internal governance terms** absent from every screen | ✔ 4 themes × 2 accounts |

Visually confirmed: the governed card shows `30 CFR 56.14132(b)(1)` with **"Verified standard text"**
beside the "HazLenz standard summary" label and `Confidence: High`; the legacy card shows the same
citation, title, text and confidence with **no badge** and the source-review caveat. Identical
reasoning, different claim about the text — the contract, on screen.

## Phase 17 — concurrency

* **Activation race** — analysis pins R1; R2 activates mid-analysis (pointer verified moved); the
  analysis still resolves R1 with identical backing and identical content; a later analysis gets R2.
* **Approval change race** — a revocation recorded against the pinned record takes effect on the next
  resolution and immediately drops `APPROVED_EXACT`, with no text carried forward. The consistency
  boundary is the **pinned release id**, and the release snapshot is immutable, so no analysis can end
  up half-old/half-new in its *content*.
* **Parallel analyses** — three concurrent pins share the same release and each retains its **own**
  mode. No request-global mutable state.

## Phase 18 — tenancy / security

* Governed enablement **does not leak between accounts**: on one server, one database, one active
  release, the allowlisted account receives `APPROVED_GOVERNED_CONTENT` and the non-allowlisted
  account receives `UNAPPROVED_CONTENT` for the identical citation, with **no governed keys at all**.
* **Both accounts receive the same citations** — governance changed the claim, not the reasoning.
* Enablement cannot be spoofed client-side: no body/query/param/header selects a mode (source scan
  over 573 customer-path files), and the principal comes only from the authenticated user.
* A client-supplied `knowledgeReleaseId` is never persisted verbatim (§ anti-spoofing gate).
* The other account cannot see this account's report through the release-bearing report list.
* `test:canonical-workflow` — 25 scenarios, **4 cross-user denials**, mass-assignment rejected.

## Phase 19 — performance

10 findings over 4 distinct citations, 40 runs after 5 warmups, disposable clone.

| Shape | mean | p50 | p95 |
|---|---|---|---|
| LEGACY (context never created) | 0.002 ms | 0.001 ms | 0.006 ms |
| governed — release pin only | 0.108 ms | 0.087 ms | 0.271 ms |
| **governed — full analysis, as shipped** | **0.795 ms** | 0.786 ms | 0.911 ms |
| SHADOW — full analysis | 0.740 ms | 0.717 ms | 0.792 ms |
| N+1 shape (rejected): pin + resolve per finding | 1.872 ms | 1.834 ms | 2.071 ms |

* **governed overhead: 0.793 ms per analysis (0.079 ms per finding)**
* **shadow overhead: 0.738 ms per analysis**
* **1.077 ms avoided** by pinning + memoising — 57.5% of the naive shape

**No N+1**: 10 findings ⇒ **4 distinct governed lookups** and **one** active-pointer read, proven by
count as well as by timing. Against a classify path dominated by seconds of AI inference this is not
a material cost, and nothing was optimised further.
