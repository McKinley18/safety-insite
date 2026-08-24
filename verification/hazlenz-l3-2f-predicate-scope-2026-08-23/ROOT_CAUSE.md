# L3-2f — root cause, proven against UNPATCHED L3-2e code

`ROOT_CAUSE_BEFORE_REMEDIATION`. Every claim below is an artifact value, not a description.
Deterministic proofs: `rootcause/f1-f4-proof-pre-patch.json`. Provider proofs:
`rootcause/f5-f6-ablation-run.json`, `rootcause/f5-confirm-run.json`.

## The recurring defect pattern, restated before any repair

§32.5 named it and §33.1, §34.6 and §35.1 refined it. Across L3-2b…L3-2e the same architectural
mistake has now been recorded **seven** times:

> a **closed or incomplete lexical admission rule** used to decide a question that is actually a
> **bounded structural property** of the clause — predicate, role, scope, polarity, or
> observation-context.

L3-2f finds it in three more functions (F1, F2, F3) and finds its **mirror image** in a fourth (F4),
where L3-2e's structural test was applied too narrowly. F5 and F6 are not this pattern at all: they
are provider-stage reasoning about **control adequacy**, and the proof below shows they are **one
mechanism, not two**.

---

## F1 — `negation-scope.ts::hasPredicate()` `F1_ROOT_CAUSE_PROVEN`

| | |
|---|---|
| **Fixture** | `F1-DNG04-went` / `F1-DNG04-was`, the pair §35.6 measured |
| **Execution path** | `negationScopes()` comma test → `hasPredicate()` → `governingNegation()` → `checkNegationAddressed()` |
| **Responsible function** | `backend/src/safescope-v2/reasoning-l3/negation-scope.ts::hasPredicate()` |
| **Blueprint** | `L3-INV-11`; §35.6 `L3_2E_SCOPE_CONTRADICTION` |
| **Class** | **ANOTHER MANIFESTATION** — seventh instance of §32.5 |

One sentence, one lexical verb apart, scoped two different ways:

| variant | comma at | scope ends at | span governed? | binder |
|---|---|---|---|---|
| "…at the manway, and the fitter **went** inside…" | 50 | **147** | **yes** | **DELETED** `SEMANTIC_NEGATION_UNADDRESSED` |
| "…at the manway, and the fitter **was** inside…" | 50 | 50 | no | survives |

**Semantic expectation:** the comma ends the negation's scope in both. **Actual:** only for `was`.

**Mechanism.** `hasPredicate()` recognises a predicate as membership in `FINITE_VERB_MARKERS`
(24 auxiliaries) OR a participle regex `\b[a-z]{5,}(?:ing|ed)\b`. Measured visibility:

`went` `fell` `broke` `cut` `torn` → **invisible**. `was` `is` `detected` `operating` → visible.

The defect is not the absent word. **Finite lexical verbs are an OPEN class and cannot be enumerated**;
predicate-hood is a positional and morphological property. That is the repair.

**Counter-fixture that must survive:** RC-08 — "with no guardrail, safety net or personal fall arrest
system in use" — scope crosses its comma (ends 126, comma at 76). A coordinated negated list carries
no finite verb and must stay in scope.

---

## F2 — `predicate-role.ts::nounPhraseHead()` via `NP_TERMINATORS` `F2_ROOT_CAUSE_PROVEN`

| | |
|---|---|
| **Class** | **ANOTHER MANIFESTATION OF F1's MECHANISM**, in a different function over a different list |
| **Direction** | PRECISION — it fails to refuse; it never deletes |

The head is "the last content word before a **listed** terminator". Measured:

| phrase | expected head | actual head |
|---|---|---|
| "no deficiencies **against** the storage standard" | `deficiencies` | **`standard`** |
| "no defects **beyond** the coupling" | `defects` | **`coupling`** |
| "no violations **per** the inspection checklist" | `violations` | **`checklist`** |
| "no hazard **of** any kind" (paired) | `hazard` | `hazard` ✓ |
| "no damage **to** the enclosure" (paired) | `damage` | `damage` ✓ |

`against` is not the defect; the **list** is. Three unlisted prepositions fail identically and the
next reader would add a fourth word. **Consequence measured at the binder:** the negative control
"The audit … recorded no hazard of any kind and no deficiencies against the storage standard",
claimed ACTIVE, **survives** — a guard that should refuse it does not fire.

> This is why F2 is repaired through F1's generalisation and not on its own. English **function
> words are a genuinely closed class**; prepositions are enumerable and complete. Verbs are not.

---

## F3 — substring containment as semantic identity `F3_ROOT_CAUSE_PROVEN`

| | |
|---|---|
| **Responsible** | `checkContradiction` path (A): `HAZARD_NEGATION_OBJECTS.find(o => head.includes(o))` over a head from `nounPhraseHead()` |
| **Direction** | **RECALL — it deletes correct findings. The high-consequence direction.** |

**TWO independent faults compose**, and either alone would have been survivable:

1. `nounPhraseHead("no hearing protection issued")` returns **`issued`** — a trailing past participle
   post-modifies the phrase, it does not head it. Also measured on "no accessory guard **fitted**"
   → head `fitted`.
2. `head.includes(o)` then matches the stem **`issue` inside `issued`**.

**Consequence measured at the binder:** the noise-exposure finding is **DELETED** with
`SEMANTIC_EVIDENCE_CONTRADICTS_STATE`. That single deletion is the entire reason `noise_exposure`
is the one family still `NOT_YET_SEALED_VALIDATED`.

`head.includes(o)` is an **unbounded admission rule**: it makes every token containing a listed stem
a member of the set. Measured siblings: `harm`⊂`harmless`, `concern`⊂`concerning`,
`access`⊂`accessory`. **Paired half that must keep firing:** "no **issue** was found" — head `issue`,
genuinely a hazard object.

---

## F4 — `checkStateSupported` CORRECTED refuses nominal corrections `F4_ROOT_CAUSE_PROVEN`

| | |
|---|---|
| **Class** | **DISTINCT MECHANISM, SAME FAMILY — and the MIRROR IMAGE of F1–F3** |
| **Provenance** | introduced by L3-2e |

F1–F3 are membership standing in for structure. F4 is a **structural test applied too narrowly**:
L3-2e correctly required a CORRECTED claim to be *asserted* rather than *mentioned*, and implemented
"asserted" as `role === ASSERTED_PREDICATE` — which equates assertion with **verbhood**.

| fixture | token role | survives | should |
|---|---|---|---|
| "the rigger **drew a replacement** from the store" | `NP_HEAD` | **no** | **yes** |
| "…was **replaced** from the store" (paired) | `ASSERTED_PREDICATE` | yes | yes ✓ |
| "**no replacement** has been drawn" (negation guard) | `NP_HEAD` | no | no ✓ |
| "talked through the **replacement procedure**" (mention only) | `ATTRIBUTIVE_MODIFIER` | no | no ✓ |

Both guards that must survive the repair already behave correctly. Per §35.1's asymmetry, this
vocabulary **ADMITS**, so it may be permissive.

---

## F5 + F6 — ONE mechanism: control adequacy, at the provider `F5_ROOT_CAUSE_PROVEN` `F6_ROOT_CAUSE_PROVEN`

The entry contract asked whether F5 is caused by F1, clause ordering, prompt weighting, or
observation-availability classification. **It is none of those.** Measured by ablation:

### F5 — `E-OA-07`

| variant | result |
|---|---|
| **orig** — reassuring clause first, hazard as "**unsupported** roof" | **NO_HAZARD_ESTABLISHED** |
| hazard clause moved first | ACTIVE ✓ |
| reassuring clause deleted | ACTIVE ✓ |
| **regime msha → osha-construction, text identical** | **NO_HAZARD_ESTABLISHED** |
| same clause position, ordinary vocabulary ("had already dropped and was not propped") | ACTIVE ✓ |
| reassuring clause kept, absence stated explicitly ("roof that had **no support set**") | **ACTIVE ✓** |
| neutral first clause, "unsupported" kept | **ACTIVE ✓** |
| reassuring clause kept, explicit absent-control predication ("**no roof support had been set**") | **ACTIVE ✓** |

**§35.5's account is superseded twice over.** It is **not** `msha` ground-control wording — the same
text under `osha-construction` fails identically. It is **not** clause position alone — the same
position with ordinary vocabulary succeeds. It is an **interaction**, and only one half is
repairable: the model does not read a control absence encoded **morphologically** (`un-supported`)
as "a required control is ABSENT". Its own words:

> "The second part describes an operational condition but **does not indicate that the unsupported
> roof section was actively unstable** or posed an immediate risk to workers."

It demands evidence of imminent failure *on top of* a stated missing control. Make the absence
explicit — in the same position, same regime, same clause order — and it classifies ACTIVE.

**Not F1.** No negation token governs the span; `negationScopes()` finds nothing to scope. The
binder never runs, because the provider emits no candidate. Stage: **provider**.

### F6 — `E-FLD-147`

| variant | provider state |
|---|---|
| **warning tape** (verbatim) | **CONTROLLED** |
| **warning sign** | **CONTROLLED** |
| **warning tape alone**, no other element | **CONTROLLED** |
| **toolbox talk / "told to watch for it"** | **no candidate at all** |
| traffic cones | ACTIVE ✓ |
| marker deleted entirely | ACTIVE ✓ |
| tape **plus** "no cover or guardrail is fitted" | ACTIVE ✓ |
| secured steel cover (counter-fixture) | CORRECTED ✓ |
| fixed guardrail with toeboard (counter-fixture) | CONTROLLED ✓ |

The model's own words: *"the warning tape suggests some control is in place"*; *"the hazard exists
but is being controlled by the sign, which serves as a visual control"*.

**The binder then refuses `CONTROLLED` correctly** (`SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE` — no
control-in-place token is present) **and the candidate is deleted rather than demoted**. So the loss
is provider-originated and binder-completed, and the genuinely effective controls are already
classified correctly, which is what makes the distinction learnable rather than architectural.

### Why F5 and F6 are one class

Both are failures on the **control-adequacy axis**, in opposite directions:

* **F5** — *under*-reads an **absent** engineering control expressed morphologically;
* **F6** — *over*-reads a **present but merely administrative** marker as an adequate control.

Both are provider-stage. Both are repaired by the same contract statement: *what makes a control a
control is that it prevents contact with the hazard, and what makes a hazard active is that such a
control is absent — however that absence is worded.*

### Does the architecture already support the distinction? — **YES**

`L3_CONTROL_HIERARCHY_LEVELS` already carries `elimination · substitution · engineering ·
administrative · ppe · unknown`, and the `CONTROLLED` rung already says *"an **effective** control".*
The contract can express warning-vs-control **without material architectural expansion**; what is
missing is the test for "effective". **This is recorded as contract-sufficient, NOT as architecture
evidence.**

---

## Shared-mechanism summary

| defect | mechanism | shares with | stage | direction |
|---|---|---|---|---|
| F1 | predicate-hood as list membership | — | binder | RECALL (high-consequence) |
| F2 | NP boundary as list membership | **F1** | binder | precision |
| F3 | semantic identity by substring + participle head | **F1** | binder | RECALL |
| F4 | assertion equated with verbhood (too narrow) | mirror of F1–F3 | binder | admission |
| F5 | absent control read morphologically | **F6** | provider | RECALL (high-consequence) |
| F6 | warning read as adequate control | **F5** | provider | RECALL (high-consequence) |

**F1, F2 and F3 are one mechanism in three functions and are repaired once**, in a shared module of
bounded English word classes. F4 is repaired in its own check. F5 and F6 are repaired once, in the
reasoning contract.
