# Phase 2 — Root-cause consolidation, re-derived from source

Each cluster re-checked against the executable code at HEAD `1feda622`, not against the prior report.

| RC | Classification | Source basis | Converges on |
|---|---|---|---|
| **RC-01** default ACTIVE | **ARCHITECTURAL_SYMPTOM** | `multi-hazard-decomposition.service.ts` — 10 of 38 hazard-push sites hard-code `conditionState:'ACTIVE'`; the rest call `inferConditionState()`, a regex cascade whose own comment says an unrecognized fragment "otherwise would" default to ACTIVE | **absence of semantic reasoning authority** |
| **RC-04** lexical brittleness | **ARCHITECTURAL_SYMPTOM** | `weighted-classifier.service.ts` + hand-authored registries; hazard identity tracks surface tokens | **same** |
| **RC-05** template corrective actions | **ARCHITECTURAL_SYMPTOM** | `actionEngine.generateActionsFromReport()` retrieves `originalSuggestion` from a canned hazard→fixes library keyed on family | **same** |
| **RC-07** phantom / over-decomposition | **ARCHITECTURAL_SYMPTOM** | the top-level `classification` is materialized as finding #1 regardless of whether a decomposed hazard corresponds to it; context clauses are routed as independent hazards | **same** |
| **RC-08** evidence fragment inverts negation | **ARCHITECTURAL_SYMPTOM** | fragment boundaries are chosen without carrying the governing negation scope; there is no mechanically verifiable span representation | **same** |
| **RC-02** `\bback\b` matches "back-up" | **DETERMINISTIC_DEFECT** | `mine-context.service.ts` — `undergroundMineSignals` includes the mine-roof token `\bback\b`; the underground branch is evaluated before the surface branch | **independent** |
| **RC-03** second unguarded `56.14132` path | **DETERMINISTIC_DEFECT** | `msha-inspection-intelligence.service.ts:201` hard-codes the `(a)` paragraph for both mine types, bypassing the corrected predicate in `evidence-foundation.ts` | **independent** |

## Dependency graph

```
                      ABSENCE OF SEMANTIC REASONING AUTHORITY
                                     │
        ┌──────────────┬─────────────┼─────────────┬──────────────┐
        │              │             │             │              │
     RC-04          RC-07         RC-01         RC-08          RC-05
  what is the    how many are   is it active  what evidence   what should
    hazard?        there?        right now?     supports it?   be done?
        │              │             │             │              │
        └──────────────┴─────────────┴─────────────┴──────────────┘
                    all five are the SAME missing capability,
                    surfacing in five different output fields

     RC-02  ──▶ mine-type token collision      ┐ independently wrong even after
     RC-03  ──▶ second hard-coded citation path┘ Level-3 reasoning exists
```

## Verdict on the stated hypothesis

**CONFIRMED.** RC-01, RC-04, RC-05, RC-07 and RC-08 are **one architectural cause with five
surfaces**, not five defects. Evidence that they are not independent:

* they co-occur — the scenarios that fabricate an ACTIVE state are largely the scenarios whose
  corrective action names an absent hazard, because both read the same lexical family label;
* they respond to the same perturbation — rewording alone (`OF4→OF5`, `OF6→OF7`) moves classification,
  condition state and citation together;
* they share one input — `fusedText` matched against registries — and one failure mode: an
  unrecognized phrasing falls through to a default.

**RC-02 and RC-03 are genuinely independent.** Neither is caused by missing semantics:

* RC-02 is a **token-collision bug in a deterministic router** that will still be wrong after Level 3,
  because Level 3 keeps deterministic retrieval and jurisdiction filtering (stage 9). A semantic layer
  that correctly understands "surface pit" would still receive candidates filtered by a mis-resolved
  mine type unless the router is fixed.
* RC-03 is a **second hard-coded citation source**. Level 3 constrains the model to *select among
  retrieved candidates*; if that unguarded path keeps injecting `(a)` into the candidate set, the model
  may legitimately select a citation that a `PROTECTED_DECISION` refused.

> **Both must survive the authority transition and are therefore scheduled inside it, not after it.**
> See `IMPLEMENTATION_PLAN.md` — RC-02 lands in **L3-4** (the slice that owns retrieval/jurisdiction),
> RC-03 in **L3-4** as well (the slice that owns candidate-set membership). Fixing them earlier would
> be premature; fixing them later would let Level-3 inherit a corrupted candidate set.

**`DO NOT` carried forward:** RC-03 must not be closed by editing `evidence-foundation.ts`. That file
is correct and `test:kg3f-56-14132-predicate` passes 16/16 against it. The defect is the *other* path.
