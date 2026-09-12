# §259 — Representation Map for H3 and H4

Produced **before** any edit, as the section requires. Zero provider calls, zero database
operations. Every path below was read from the tree and every claim about the hosted outputs was
read from `RAW-254-FIRST-PASS.jsonl`, which was not modified.

---

## 1. H3 carrier map

| # | element | location |
|---|---|---|
| 1 | **Unresolved / declaration carrier** | `unresolvedFactDeclarations[]`, a top-level sibling collection. Item schema at `expert-first-pass-instruction-vnext.ts:397`. Identity field `declarationId` |
| 2 | **Hazard-candidate carrier** | `expertHazardCandidates[]`, a top-level sibling. Identity field `candidateKey` |
| 3 | **Posture / driver carrier** | `immediateSafetyPosture`, with three reference-bearing members: `requiredBy[]` and `acceptedWithoutImmediateAction[]`, each `{refKind, ref, …}`, and `resumeCondition.resolvedByDeclarationIds[]`, a list of bare `declarationId` strings |
| 4 | **Current reference fields** | `requiredBy[].ref` + `refKind`, `acceptedWithoutImmediateAction[].ref` + `refKind`, and `resumeCondition.resolvedByDeclarationIds[]` |
| 5 | **The deterministic rule that refuses** | `expert-233-posture-projection.ts:347-349`. Coverage is computed as `covered = new Set([...requiredBy, ...accepted].map(r => refKind + ':' + r.ref))`, then every emitted `declarationId` absent from that set raises `DECLARATION_NOT_COVERED` |

### 6. Why the relationship was not representable without provider cross-bookkeeping

**The coverage set is built from two of the three reference-bearing members and ignores the third.**

`resumeCondition.resolvedByDeclarationIds` references declarations **by their stable structural
identifier**, and it is already validated: `RESUME_CONDITION_REF_UNRESOLVED` fires when the id names
no emitted declaration. It is the single most consequential placement a declaration can have,
because it states that work does not resume until that declaration is resolved. It is nonetheless
not counted as coverage.

On H3 the model wrote exactly that:

```
declarations emitted            : ["decl-slab-capacity"]
requiredBy                      : HAZARD_CANDIDATE:cand-slab-capacity-unknown
                                  HAZARD_CANDIDATE:cand-mewp-overturn
acceptedWithoutImmediateAction  : []
resumeCondition.resolvedByDeclarationIds : ["decl-slab-capacity"]
posture                         : HOLD_PENDING_VERIFICATION
```

`decl-slab-capacity` was named by ID, in the posture, as the condition gating resumption. Its
subject twin `cand-slab-capacity-unknown` was cited as a continuation-controlling driver. The
posture was protective. The analysis then refused for not covering a declaration that it had
referenced by exact identifier three lines lower.

**This is a defect in the deterministic coverage rule, not in the contract's expressive power and
not in the model's output.** The contract already carries a stable structural reference for exactly
this relationship. Nothing in the wire schema needs to change to fix H3.

A second contributing factor is recorded but is **not** repaired here, because repairing it would
be driver-role tuning and is out of scope: `DRIVER_ROLE_REF_KINDS_239` permits
`UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION` to reference either `UNRESOLVED_DECLARATION` or
`HAZARD_CANDIDATE`. The model had a free choice of carrier with an invisible coverage consequence.
Counting the resume condition removes the consequence without touching the role vocabulary.

---

## 2. H4 carrier map

| # | element | location |
|---|---|---|
| 1 | **Where the discharging control is authored** | `immediateSafetyPosture.requiredControls[]`. Interface `RequiredControl233` at `expert-233-posture-contract.ts:175` is `{ control: string; timing: ControlTiming233 }`. Transmitted item schema at `expert-233-posture-contract.ts:337-349`, inherited unchanged through §237, §239, §247 and §253 |
| 2 | **Where it is repeated or referenced** | `immediateSafetyPosture.requiredBy[].roleJustification.dischargingControlRef`, a free string. Transmitted description at `expert-247-posture-contract.ts:224-228` |
| 3 | **The field requiring exact textual self-reference** | `dischargingControlRef`. Schema text: "The exact `control` text from your own requiredControls that discharges THIS entry." System prompt, `expert-247-posture-contract.ts:361-363`: "you must name dischargingControlRef: the exact control text from your own requiredControls" |
| 4 | **The deterministic rule that refuses paraphrase** | `expert-247-role-justification-projection.ts:79-83` builds `controlTexts` as a `Set` of trimmed `control` strings; line 145 raises `DISCHARGING_CONTROL_NOT_IN_REQUIRED_CONTROLS` when `!controlTexts.has(ref.trim())`. Trim-normalized **exact string equality** |
| 5 | **Does a stable structural reference already exist?** | **No.** `RequiredControl233` has no identifier of any kind. The control text is the only thing that can name a control, so the contract has no choice but to demand a verbatim copy |

On H4 the model authored the control once and then referred to it in different words:

```
requiredControls[1].control
  "Supervisor or permit issuer to track progress against the 15:30 planned finish and confirm
   before 16:00 whether work is complete, needs extension, or must cease"

requiredBy[0].roleJustification.dischargingControlRef
  "Monitor progress against the 15:30 planned finish time and ensure hot work ceases or is
   re-authorised before the 16:00 permit expiry"
```

Same actor-agnostic action, same two clock times, same three outcomes. The binding was substantively
present and the exact-string test refused it.

**H4 is the case the section's architectural principle names directly**: the contract asks the
provider to write a fact once, rewrite it elsewhere, and match its own wording perfectly. Unlike
H3, fixing it does require a wire change, because there is presently nothing stable to reference.

---

## 3. Exact root representation defect

Two distinct defects that present as one failure family.

**H3 — an authoritative structural reference exists and the deterministic rule does not read it.**
The declaration carrier already has a stable id, and the posture already references declarations by
that id in `resumeCondition.resolvedByDeclarationIds`. The coverage rule reads only two of the three
reference-bearing members. No provider bookkeeping is actually required; the rule is simply
incomplete.

**H4 — no structural identity exists for a control, so prose is forced to serve as identity.**
`requiredControls[]` items are anonymous. The only way to name one is to reproduce its text, so the
contract mandates duplicate natural-language content and then adjudicates safety on string equality.

---

## 4. Old source-of-truth model

| entity | authoritative source | how other locations refer to it |
|---|---|---|
| Unresolved fact | `unresolvedFactDeclarations[].declarationId` | **By id** from `requiredBy`/`accepted` (as `ref`), **by id** from `resumeCondition.resolvedByDeclarationIds`, **by id** from the optional clarification back-reference. Already correct |
| Hazard candidate | `expertHazardCandidates[].candidateKey` | **By id** from `requiredBy`/`accepted`, and from the optional `relatesToCandidateKey`. Already correct |
| **Required control** | `immediateSafetyPosture.requiredControls[].control` — **the prose is the identity** | **By verbatim copy** into `dischargingControlRef`. Second authorship competing with the first |

Every entity in the contract is already referenced by stable id **except** controls.

## 5. New source-of-truth model

| entity | authoritative source | how other locations refer to it |
|---|---|---|
| Unresolved fact | unchanged, `declarationId` | unchanged. The coverage rule additionally **reads the resume condition**, which was always an id reference |
| Hazard candidate | unchanged, `candidateKey` | unchanged |
| **Required control** | `requiredControls[]` item, identified by a new **`controlId`** | **By id** from `dischargingControlRef`. The control prose is authored exactly once |

One authoritative authored source per entity, referenced by identity everywhere else. No duplicated
natural-language content remains anywhere in the affected paths, and no location carries a second
independent authorship of the same fact.

---

## 6. Planned successor, stated before implementation

**H3 — deterministic only. No wire change, no prompt change.**
`expert-233-posture-projection.ts` computes coverage over
`requiredBy ∪ accepted ∪ resumeCondition.resolvedByDeclarationIds`. Declarations only; active
candidates are unaffected because the resume condition cannot name a candidate.

**H4 — smallest additive wire change, following the established successor pattern.**
A `§259` module clones the §253 schema head and adds a required `controlId` to each
`requiredControls` item, with a `reconstruct253…` inverse proving byte-reversibility, exactly as
§253 does over §247. `dischargingControlRef` is retargeted from control **text** to control **id**;
the §247 M8 check resolves against the id set; duplicate `controlId` values are refused so a
reference can never be ambiguous. The transmitted description and the system-prompt line are changed
to state the id rule, because the deterministic rule and the provider-visible instruction must state
the same thing in both directions.

**Explicitly not done:** no coverage or self-reference requirement is relaxed, no fuzzy or
similarity matching is introduced anywhere, no role taxonomy or justification field is added, no
driver-role semantics are touched, and `DRIVER_ROLE_REF_KINDS_239` is left exactly as it is.
