# Verifier evaluation-truth denominator policy

**Opened §159, 2026-09-04. Governs which cases enter which verifier measure, from this point forward.**

This document exists because HS-H1 was adjudicated `AUTHORING_AMBIGUOUS` by the product owner, and
that adjudication had to change something without changing history. It records exactly what it
changes and exactly what it does not.

---

## The rule

> **A case removed from a denominator is removed PROSPECTIVELY. Every historical figure stays exactly
> as it was executed, under the standard that was in force when it was executed.**

A historical score is evidence of what was measured, not a claim that the standard was right. Editing
it to reflect a later adjudication destroys the record of the adjudication having been needed.
Re-deriving §156 or §157 against a revised standard is therefore prohibited; a re-derivation is a new
measure with a new name, computed alongside the old one and reported beside it.

**Match the scope of an exclusion to the scope of the defect.** A row whose underlying safety concern
is sound stays available to every measure except the one whose authored artifact was found wanting.
Excluding a case from more denominators than the defect reaches throws away usable evidence.

---

## HS-H1 — the first entry

**Disposition: `AUTHORING_AMBIGUOUS`.** Returned by the product owner 2026-09-04 against
`verification/expert-hazlenz-hs-h1-human-adjudication-2026-09-04/HS-H1-HUMAN-ADJUDICATION-PACKET.md`
(sha256 `8182cb4e324a5ac24049b1aaef1e6298b78c61e8949b510f06cc86d07e84a63f`).

Recorded verbatim, because the reasoning is narrower than the disposition label and the narrowness is
the point:

> The general concern that load thermal state may remain hazardous despite zero chamber pressure is
> valid.
>
> The authored cooling-hold selector is not uniquely supported because the observation does not
> establish the load type, cycle type, manufacturer/SOP unload criteria, or that a cooling hold is
> the applicable safe-unloading mechanism.
>
> Zero chamber pressure/interlock release does not establish safe liquid-load temperature, but
> absence of a cooling hold does not by itself establish that opening must stop for every possible
> load.

### What that means, stated as a test

Two propositions were separated, and only one of them survived:

| proposition | status |
|---|---|
| The observation does not **settle** whether the load is safe to unload | **upheld** |
| One specific named mechanism — a cooling hold — is **the** fact that governs the decision | **not established** |

The first can hold while the second fails. **A selector naming a specific mechanism is uniquely
supported only when the observation establishes the conditions under which that mechanism is the
applicable one.** HS-H1's observation names no load type, no cycle type and no unload criterion, so
it does not reach that bar.

### Exactly what is excluded

| measure | HS-H1 status from §159 forward |
|---|---|
| `B_selectorAccuracy` — strict selector-based semantic accuracy | **EXCLUDED** |
| `E_nominationAccuracy` — selector-based | **EXCLUDED** |
| `HS_H1_RECOVERED` — selector-based by construction | **RETIRED as a gate** |
| `A_decisionCriticalRecall` — verdict-level, not selector-level | **EXCLUDED**, because the case's correct verdict depends on the same unsupported selector |
| `C_legitimateSilenceSpecificity` | not applicable — HS-H1 was never a silence case |
| `F_falseNominationCount` | **RETAINED** — counts nominations on cases where silence was right; independent of HS-H1's selector |
| `G_abstainCount`, `H_boundaryRejectionCount` | **RETAINED** — mechanical counts, no authored selector involved |
| contract-admission and containment evidence | **RETAINED** — HS-H1's draws remain valid evidence that the boundary behaved |

### Exactly what is NOT changed

- §156 `VERIFIER-SCORES.json` and §157 `VERIFIER-V2-SCORES.json` are **untouched**, including
  `A_decisionCriticalRecall 1/3`, `B_selectorAccuracy 1/3` and `HS_H1_RECOVERED 0/2`.
- The frozen §156 truth manifest is **untouched**; HS-H1's entries stay in it, and the exclusion is
  applied by the consumer, not by editing the standard.
- The v9 fixture row HS-H1 is **untouched**. It is not deleted, not rewritten, and not reclassified.
- No first-pass measure changes. The adjudication was about a verifier selector.

---

## The consequence nobody should have to discover later

Removing HS-H1's two draws from the strict selector denominator leaves that denominator **very thin**,
and this must be stated wherever the re-derived figure appears.

| | before | after HS-H1 removal |
|---|---|---|
| decision-critical primary draws | 4 | **2** |
| distinct fixture rows behind them | 3 | **2** (HS-A1, HS-E1) |
| legitimate-silence primary draws | 7 | 7 |
| distinct fixture rows behind those | 3 | 3 (HS-P1 ×3, HS-R1 ×3, HS-N1 ×1) |

**Two draws over two rows cannot support a recall figure.** Any percentage computed on that
denominator is a ratio of small integers and must be reported as counts, never as a percentage, and
never as a rate. The correct response to a denominator this thin is more human-reviewed truth, not a
more confident presentation of what little there is.

---

## Standing requirements on every future verifier figure

1. Report **counts**, not percentages, on any denominator below 10.
2. State the **human-review status** of the truth each figure was scored against —
   `AUTHORED_BY_EVALUATED_MODEL_FAMILY` until a human disposition exists for that row.
3. Never let an excluded case silently vanish. Print it as excluded, with its disposition and the
   date, so a reader can see the denominator was reduced and why.
4. A row with **no** human disposition is not thereby valid. Absence of adjudication is not
   adjudication.

---

# Part 2 — Truth admission standard (§161, product owner, 2026-09-04)

Two standing decisions. Both are policy, not rulings about any one row, and both take effect
prospectively while leaving every historical figure exactly as executed.

## 2.1 The keyword selector scorer is retired

```
B_SELECTOR_ACCURACY_KEYWORD_SCORER_PROSPECTIVE_AUTHORITY = RETIRED
```

The keyword-set matcher is **not fit for purpose as an authoritative prospective semantic
selector-accuracy scorer.** The evidence was mechanical and is recorded in §160 FINDING 1: on **three
of the four** REQUIRED verifier cases the authored keyword set was already satisfied by the
**observation text itself** —

| case | row | satisfied by the observation via |
|---|---|---|
| VC-02, VC-13 | HS-H1 | `["load","temperature"]` — "the **load** trolley", "the over-**temperature** alarm" |
| VC-08 | HS-A1 | `["flame","fail"]`, `["flame-failure"]` — "the **flame-failure** device … behind that shroud" |
| VC-04 | HS-E1 | *(does not match)* |

— so on those three a question that merely echoes the observation scored as reaching the owed fact.

### Exact scope of the retirement

**Retired:** any *prospective* use of keyword overlap to decide whether a proposed clarification
reaches an authored fact. The forward consumer must **refuse to emit the figure**, not silently
compute a weaker one.

**Not retired, and not to be edited:**

- historical `B_selectorAccuracy` figures — §156 `1/3` and §157 `1/3` stand, immutable;
- the historical scorers `score-expert-verifier-accuracy.ts` and `score-expert-verifier-v2.ts`,
  which reproduce those figures and must keep reproducing them unchanged;
- keyword matching used as a **diagnostic** rather than as a score — §160's limb A, for example,
  which reports where a term appears and decides nothing.

**No replacement selector scorer is authorized.** Disable before replacing. Building one requires its
own authorization, and a semantic matcher that has not itself been validated would inherit the
problem it was built to fix.

## 2.2 Observation-only truth is admissible, under six conditions

```
OBSERVATION_ONLY_TRUTH_ALLOWED = TRUE

OBSERVATION_ONLY_TRUTH_REQUIREMENTS =
    HUMAN_REVIEWED
  + FACT_GENUINELY_UNRESOLVED
  + PLAUSIBLE_ALTERNATIVE_STATES
  + MATERIAL_CURRENT_DECISION_DIVERGENCE
  + NECESSARY_NOW
  + SEMANTIC_SELECTOR_MATCH_NOT_KEYWORD_OVERLAP
```

An authored decision-critical clarification **may** rest on the observation text alone.

- **Governed regulatory evidence is NOT mandatory** — *unless the claimed decision distinction itself
  depends on regulatory interpretation*, in which case it is.
- **Deterministic HazLenz support is NOT mandatory.**

This settles §160 FINDING 2 as a policy matter: that no row carried governed or deterministic support
is **not** by itself disqualifying. It does not settle any row, because the six conditions above
still have to be established by a human, one row at a time.

All six are conjunctive. Five of six is not admission. A row with no disposition is not thereby
valid — **absence of adjudication is not adjudication.**

### What a consumer must record per row

Any instrument that admits a row to a prospective semantic measure must record all six, per row,
with the human's own determination. The required shape is published as
`ROW-TRUTH-DISPOSITIONS.TEMPLATE.json` beside the live ledger. The live ledger is **not** modified by
this document; extending it is the product owner's to approve.

`rederive-verifier-performance-on-human-truth.ts` enforces this in code: it refuses to admit a row
whose six conditions are not all recorded `true`, and it refuses to emit `B_selectorAccuracy` at all
while 2.1 stands.
