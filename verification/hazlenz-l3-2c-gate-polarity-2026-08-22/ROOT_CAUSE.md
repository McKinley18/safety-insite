# L3-2c — root cause, demonstrated before any patch

`ROOT_CAUSE_BEFORE_REMEDIATION`. Every claim below was produced by executing the **unpatched** code.
Artifacts: `rootcause/proof-pre-patch.json`, `rootcause/clarification-pre-patch.json`, and the
post-patch counterparts. `rootcause/gate-behaviour-diff.json` measures the old gate against the new
one on the same strings, so no behavioural claim in this document rests on reading source.

L3-2 and L3-2b had already root-caused all three. `DO_NOT_REINVESTIGATE_WITHOUT_NEW_EVIDENCE` was
applied: the existing findings were re-executed for confirmation, not re-derived. Two of the three
confirmations produced **new** evidence, recorded below rather than folded silently into the repair.

## R1 — impression-gate polarity

`checkSubjectiveImpression` refused an ACTIVE claim unless `hasUnhedgedFact()` found a word from
`FACTUAL_CONDITION_TOKENS` outside a hedge window. `sheared` is not one of the 30 entries, so

> The mezzanine gate did not look right to me and the lower hinge pin **is sheared off** with the
> gate hanging on the top hinge alone.

was read as pure impression and a correct high-consequence ACTIVE was deleted (`H-AM-05`).

**Reproduced, and isolated from R2.** Two fixtures, both fatal on
`SEMANTIC_SUBJECTIVE_IMPRESSION_NOT_ACTIVE` alone:

| fixture | why it isolates R1 |
|---|---|
| H-AM-05 with the WHOLE sentence as the span | the span carries its own negation, so `checkNegationAddressed` steps aside by construction |
| the same sentence with `seemed wrong` for `did not look right` | `negationScopes()` returns **zero** scopes — the R2 change cannot reach this fixture at all |

### NEW EVIDENCE 1 — H-AM-05 has a SECOND, independent death path

`NEXT_ACTION.md` attributed `H-AM-05` to the impression gate alone. With a **narrow** factual span,
the same sentence dies instead on `SEMANTIC_NEGATION_UNADDRESSED`: `not` in "did not look right"
scopes across the bare `and` and governs the factual clause — the R2 defect. Which path fires depends
on how the model chose its span. **This is the second time a phase has found the prior phase's single
attribution incomplete** (§32.1 recorded the same for `B08`), and it is why R1 and R2 were each given
a fixture the other change provably cannot repair.

### NEW EVIDENCE 2 — the gate's ENTRY condition was a closed list too, failing the other way

The check only ran when a phrase from `SUBJECTIVE_IMPRESSION_TOKENS` appeared. `struck me as` is not
on it, so `H-AM-01` — "The overhead door track struck me as odd" — was **admitted as ACTIVE with no
gate run at all**. Measured pre-patch: `H_AM_01_currently_rejected: false`. L3-2b never saw this
because its model returned no candidate for that scenario, so the pipeline result concealed a latent
false ACTIVE. `L3-2C-DISC-01`.

**The architectural finding stands and is now four instances deep:** control-in-place (L3-2), family
relevance (L3-2b development), factual condition (L3-2b holdout), impression entry (L3-2c). A closed
positive vocabulary used as an admission gate fails in both directions.

## R2 — bare `and` does not end negation scope

`negationScopes()` applies `hasPredicate()` to the segment after a **comma**, and to nothing else.
`and` appears in `CLAUSE_STARTERS` only as the two-word `and separately`.

Measured pre-patch on "…; no LOTO is applied **and** the guard is missing.":

```
governingNegation("the guard is missing") -> { token: "no", governs: "no LOTO is applied and the guard is missing" }
-> SEMANTIC_NEGATION_UNADDRESSED -> the guarding candidate deleted
```

The fixture contains **no subjective language at all**, so the R1 change cannot repair it.

**The trap that makes this non-trivial** is unchanged from L3-2b: `and` is also the ordinary way to
continue a negated list. Measured pre-patch and required to stay identical:

```
"no guardrail and no personal fall arrest and no warning line"   scope crosses both conjunctions
"no guardrail, safety net or personal fall arrest system in use"  scope crosses the commas (RC-08)
"no guardrail and no toeboard"                                    scope crosses
```

## R3 — clarification recall 1 of 3

Re-executed against the live provider before any prompt change, reproducing L3-2b's number exactly
and separating its two causes, which are different failures:

| id | pre-semantic candidates | what went wrong |
|---|---|---|
| `H-AM-01` | **0** | no candidate at all, so nothing could carry a question |
| `H-AM-02` | 1, `ACTIVE`, `clarification: null` | asserted instead of asking; the binder deleted it |
| `H-AM-03` | 1, `INSUFFICIENT_EVIDENCE` + clarification | correct |

### NEW EVIDENCE 3 — the pipeline discarded a clarification it had already decided was owed

On `H-AM-02` the binder raised **both** `SEMANTIC_SUBJECTIVE_IMPRESSION_NOT_ACTIVE` **and**
`SEMANTIC_CLARIFICATION_EXPECTED_NOT_SUPPLIED`, then deleted the candidate — destroying the only
carrier the clarification could travel on. The knowledge existed and was thrown away one line later.
That is a transport gap inside the carrier-candidate architecture, not a reason to redesign it.

`H-AM-01` cannot be repaired in the binder: the binder may refuse a candidate, never invent one
(L3-INV-08). Only the prompt can produce the missing carrier.

## Defects discovered but NOT remediated

Recorded, root-caused, deliberately unfixed — a fourth semantic remediation area is outside this
phase's authorized scope, and two of the three were found only after the sealed holdout was opened.

| id | defect | evidence | why not fixed |
|---|---|---|---|
| `L3-2C-DISC-01` | impression-gate ENTRY was a closed list; `struck me as` admitted a false ACTIVE | `rootcause/proof-pre-patch.json` | **closed incidentally** by R1's structural test; recorded because it was a latent safety defect nobody had measured |
| `L3-2C-DISC-02` | ACTIVE contradicted by control-in-place evidence is owned by **no** check. The old gate refused "the wheel guards are all fitted" only by the accident of an absent factual word — the same accident that deleted `H-AM-05` | `rootcause/gate-behaviour-diff.json`, verdict `REGRESSED_BY_L3_2C` | a fourth remediation area; out of scope |
| `L3-2C-DISC-03` | `HAZARD_NEGATION_OBJECTS` matches `hazard` inside **"without hazard warning labels"**, where `hazard` is a modifier and `warning labels` is the head. The absence of a hazard warning label IS the HazCom hazard. Deleted 4 correct findings on the fresh holdout | `results/holdout-score-1.json` rows `C-FLD-018/038/118/128` | found **after** the sealed holdout was opened; patching it now would be exactly the post-hoc tuning L3-2b refused for `H-AM-05` |
| `L3-2C-DISC-04` | `CORRECTION_TOKENS` contains `applied`, so "**no** LOTO **is applied**" reads as a correction and fails `checkContradiction` | `rootcause/proof-post-patch.json`, the `loto` candidate | same class as DISC-03 — a closed list matched inside a negation; out of scope |

`DISC-03` and `DISC-04` are the **same architectural pattern this phase exists to close**, in two
further places: a closed vocabulary consulted without regard to the syntactic role of the match.
