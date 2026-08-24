# L3-2e — root cause, demonstrated before any patch

`ROOT_CAUSE_BEFORE_REMEDIATION`. Every claim was produced by executing the **unpatched L3-2d code**.
The markers are in `rootcause/PROVEN.txt`, written before the first implementation edit.

## E1 — syntactic role `E1_ROOT_CAUSE_PROVEN`

Artifact: `rootcause/e1-proof-pre-patch.json` — 12 fixtures, **7 defects reproduced**, all 4 paired
halves still correct.

**The two checks are not the same defect**, and the entry contract was right to warn against
assuming they are:

| check | how it uses the vocabulary | how a false positive hurts |
|---|---|---|
| `checkContradiction` | to **REJECT** | **deletes a correct finding** |
| `checkStateSupported` | to **ADMIT** a state the model already claimed | **accepts a wrong state** |

### checkContradiction — five deletions, three of them high-consequence

| fixture | token | actual role | cost |
|---|---|---|---|
| `D-FLD-175` | `discarded` | attributive modifier on "conveyor rollers"; the predicate is "is blocked" | **high-consequence electrical deleted** |
| `NEG-APPLIED` | `applied` | asserted predicate **under a governing negation** — a negated correction is not a correction | **high-consequence LOTO deleted** |
| `GUARD-REMOVED` | `removed` | asserted predicate whose **subject is the control** — removing a guard creates the hazard | machine-guarding deleted |
| `DISC-03-LABEL` | `hazard` | attributive modifier in "hazard warning labels"; the NP head is `labels`, a control | hazcom deleted |
| `DISC-03-DAMAGE` | `damage` | the negation governs its own clause; the hazard is asserted in the contrastive one | **high-consequence electrical deleted** |

The `HAZARD_NEGATION_OBJECTS` test was `governed.includes(o)` — a **substring** match, not
word-boundary. That detail matters later.

### checkStateSupported — two admissions, NEW and not previously documented

| fixture | what was wrongly admitted |
|---|---|
| `SS-MODIFIER-ADMITS` | `CORRECTED` accepted on `discarded` appearing as a **modifier** |
| `SS-NEGATED-ADMITS` | `CONTROLLED` accepted on **"no guardrail was in place"** — the negation ignored entirely |

> **NEW EVIDENCE.** §34.6 documented the syntactic-role defect only as a DELETION mechanism. It runs
> in the ADMISSION direction too, in a different check, and nobody had measured it. The second row is
> the more serious of the two: it labels a live hazard as controlled, which at the customer tier is a
> missed hazard wearing a reassuring label.

## E2 — observation availability `E2_ROOT_CAUSE_PROVEN`

Artifacts: `rootcause/e2-proof-pre-patch.json`, `rootcause/e2-clause-position-ablation.json`.

A four-cell matrix varying the two properties **independently**, which is what makes this a
discriminator proof rather than two anecdotes:

| cell | unobserved fact? | is it the DECIDING fact? | expected | measured pre-patch |
|---|---|---|---|---|
| A | yes | yes | INSUFFICIENT + question | 2 of 3 |
| B | yes | **no** | ACTIVE, no question | **3 of 3 — already correct** |
| C | no | n/a | ACTIVE, no question | 1 of 2 |
| D | silent | n/a | INSUFFICIENT + question | fixture mislabelled |

> **Cell B was already correct before any repair.** The model does not over-generalise
> could-not-observe wording, which is direct evidence against any global change in clarification
> pressure — exactly what the entry contract warned against.

### The mechanism, and it contradicts the documented account

§34.5 and L3-2d's `NEXT_ACTION.md` described `D-NG-04` / `D-CR-04` as an **oscillation** between the
ACTIVE and INSUFFICIENT_EVIDENCE rungs. A clause-position ablation says otherwise:

| variant | result |
|---|---|
| `NG04-orig` "**No** flammable atmosphere was detected …, and the fitter went inside" | INSUFFICIENT |
| `NG04-noNegation` "The atmosphere **was tested** …, and the fitter went inside" | **INSUFFICIENT** |
| `NG04-secondClauseAlone` "The fitter went inside …" | **ACTIVE** |
| `NG04-negationLast` "The fitter went inside …, and no flammable atmosphere was detected" | **ACTIVE** |
| `CR04-orig` "Two men were on the roof near the edge; I was too far away to see …" | ACTIVE |
| `CR04-observeFirst` "I was too far away to see whether the two men … were tied off" | **INSUFFICIENT + question** |

**Removing the negation changes nothing. Moving the clause changes everything.**

The mechanism is **clause position**: the whole observation is classified from its FIRST clause and
every later one is under-weighted. `D-NG-04` and `D-CR-04` are therefore not competing pressures —
they are one defect seen from two sides: a reassuring clause first loses the hazard in clause two; a
situation clause first loses the unobserved deciding fact in clause two.

This redirected the E2 repair away from clarification pressure entirely and onto per-clause
evaluation.

### Fixture labelling correction, made in development and before sealing

`E2-D-01` was first written as *"Looked at the chemical store on the way past."* with
`clarificationExpected: true`. That is inconsistent with the established precedent `H-AM-04`
(*"Walked the yard."*, labelled FALSE): with nothing to suspect there is nothing to ask about, and the
engine returning no candidate was right. **The label was wrong, not the engine.** Both cases are now
carried — the bare walk at its correct FALSE, and a real cell-D case (a suspicion recorded, no fact
that could decide it). Recorded here so the change is visible rather than silent.

## Independence

E1 is proven entirely **offline through the binder**, on fixtures containing no
observation-availability wording. E2 is proven entirely **at the provider stage**, on fixtures whose
candidates the binder never rejects. Neither proof can be credited to the other's repair.
