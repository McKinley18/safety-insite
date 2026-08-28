# Finding-level governed standards integration — the contract

**Nothing here is implemented. `evidence-foundation.ts` is unmodified and no replacement library
exists.** This supersedes the proposal in
`../insite-v1-regulatory-source-acquisition-2026-08-28/FINDING_LEVEL_ARCHITECTURE_PROPOSAL.md` by
making it a contract the next phase can be held to.

## 1. The target path

```
customer observation
  → deterministic hazard finding          (multiHazardDecomposition.hazards — unchanged)
  → jurisdiction / context                (inspection.regulatoryContext, with provenance)
  → existing evidence/applicability predicate   (evidence-foundation.ts — RETAINED)
  → governed standards lookup             (release federal-core-2026-08-28.1, 64 approved records)
  → deterministic applicability validation
  → governed citation + provenance
  → finding persistence
  → report
```

## 2. How a finding references a governed standard

A finding's `sourceCandidate.standardCandidates[]` entry must carry **all** of:

| field | source | why it is required |
|---|---|---|
| `citationKey` | `releaseCitationKey(citation)` | the logical regulatory identity; unifies `1910.147` and `29 CFR 1910.147` while keeping `1926.50` and `1926.501` distinct |
| `citation` | governed record | the human-readable citation the customer reads |
| `releaseId` | the release the lookup resolved in | **without it, provenance cannot say which content was cited**; this is the field the release-identity repair exists to make meaningful |
| `recordChecksum` | `regulatory_release_records.recordChecksum` | pins the exact record version, so a later release cannot retroactively change what a finding claimed |
| `jurisdiction` | governed record `scope` | proves the citation belongs to the regime the inspection declared |
| `backingStatus` | `resolveStandardsBacking()` | the only field that may say `APPROVED_GOVERNED_CONTENT` |
| `applicability` / `missingPredicates` / `explanation` | the retained predicates | why this standard was selected, and what evidence is still missing |

`releaseId` + `recordChecksum` together are the durable answer to "what exactly was the customer
told, and can we still retrieve it" — the property
`test:release-integrity-and-approval` already protects for analyses.

## 3. Disposition of `evidence-foundation.ts`

**Migrate its citation authority; keep its deterministic applicability logic.**

| asset | disposition |
|---|---|
| applicability predicates (`servicing`, `energyCapable`, the honest `UNKNOWN` jurisdiction gates, contradiction handling) | **RETAIN** — this is the reasoning no corpus supplies |
| hard-coded citation literals | **CONVERT** to a lookup keyed by (hazard family, jurisdiction) over the governed release |
| decision model (`SUPPORTED` / `NOT_SUPPORTED` / `CONTRADICTED` / `UNKNOWN` / `NOT_APPLICABLE`) and `missingPredicates` | **RETAIN and reuse verbatim** |
| the module as a deterministic fallback | **RETAIN** until a measured parity run justifies retirement |
| `explanation` text | **RETAIN** — it is the customer-visible "why selected" step |

**Do not delete it. Do not build a second mini-library beside it.**

## 4. Fallback behaviour — explicit

Three states, and the boundary between them is the load-bearing part:

1. **Governed lookup resolves an approved record** → cite it, `backingStatus`
   `APPROVED_GOVERNED_CONTENT`, carrying `releaseId` and `recordChecksum`.
2. **Governed lookup resolves an unapproved or non-member record** → cite it if the predicates
   support it, `backingStatus` `UNAPPROVED_CONTENT`. The 8 records this phase rejected fall here,
   and the candidate-release validation already proves they cannot reach state 1.
3. **Governed lookup resolves nothing and a retained code-resident predicate would have cited
   something** → the citation may still stand on the evidence decision, but **only** as
   `CITATION_ONLY`.

> **No silent fallback may cause an unapproved code-resident citation to appear as approved
> governed content.** State 3 must never be presented as state 1. This is the single assertion the
> next phase's gate must make first, and it should be written before the integration code.

## 5. What the next phase must measure

* **Parity before retirement** — every citation `evidence-foundation.ts` emits today for the frozen
  56-row corpus is either reproduced by the governed path or its removal is justified case by case.
* **The protected floor holds** — recognition 43/43, actionable 43/43, life-critical 35/35,
  Population A precision 100 %, forbidden emissions 0.
* **Jurisdiction safety holds** — `wrong-jurisdiction` and `wrong-standard` both stay at **0**,
  where the last two phases measured them.
* **The unresolved-jurisdiction ranking defect**, carried forward: 4/5 obvious cases recovered, the
  LOTO miss caused by ranking, one administrative false positive. Evaluate it against the reviewed
  corpus and customer behaviour before deciding whether to change any threshold.
* **Coverage is not the success criterion.** 26 of 43 required groups had no standard at the
  finding level before this work; the governed corpus now holds authority for all of them, but
  families whose applicability genuinely requires context the observation lacks must resolve to
  `needs_more_evidence` with a clarification question — not to an asserted citation. Five of the 72
  matrix cells are correctly `NO_STANDARD_APPLICABLE` and must stay so.
