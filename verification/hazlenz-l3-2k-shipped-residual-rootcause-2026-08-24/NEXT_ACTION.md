# L3-2k — what is closed, and the programme decision that follows

## Terminal

> ### `L3_2K_COMPLETE — SHIPPED_PROVIDER_DELTA_ROOT_CAUSED`
> ### `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Blueprint **§43**. Decision log **`D-63`** (`F-WC-09`) and **`D-64`** (`C-CS-05`), both additive.
`D-55` … `D-62` preserved. §29–§42 not rewritten. HEAD `1feda622`. **Nothing was repaired.**

## Is L3-3 eligible?

**No, and this phase did not move that gate.** `L3-3 must not start until` the high-consequence gate
reaches **zero on FRESH SEALED evidence** with the clarification axis still at **100/100**. No sealed
evidence was opened. Family coverage remains 24 of 24.

---

## What L3-2k settled, so the next phase does not re-derive it

* **`F-WC-09` is not a mislabel — it is a deletion.** qwen proposes one candidate at `CONTROLLED`, the
  validator passes it, and the **semantic binder rejects it** (`SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE`),
  leaving `boundHazards: []`. The customer receives no hazard on a high-consequence scenario. Every
  metric recorded before this phase stopped at the validator and could not see it.
* **The pipeline already holds the correct fact.** `control-adequacy.ts` records
  `CONTROL_ABSENT / "strapped down"` on that very candidate, and by §36.4 / `L3-INV-12` it decides
  nothing. Do not read this as an instruction to make it decide.
* **The binder is not the origin.** `F-WC-03`, same process, same prompt, same `CONTROL_ABSENT`
  advisory, model state `ACTIVE` → hazard delivered. The state choice decides the outcome.
* **Gemini's `F-WC-09` candidate survives the binder to `ACTIVE`**, twice, so the shipped-path delta is
  real and larger than §42's model-tier `13/13 vs 12/13` implied.
* **`C-CS-05` is two effects, not one.** The one-block move makes qwen raise a MUST-NOT-ASK question
  **deterministically (4/4)**; provider variance demotes the state to `INSUFFICIENT_EVIDENCE`
  **1 time in 4** on byte-identical prompts in separate processes. The false question reaches the
  customer only when both happen.
* **§34.2's gate is defeated by demotion exactly as §41.3 recorded it defeated by dropping.** Same
  control, two unrelated perturbations, one structural route. The gate is **load-bearing, not lax** —
  it is what lets all 5 legitimate `CLARIFICATION_REQUIRED` scenarios keep their question.
* **Both residuals sit at the same boundary: the model's single-enum `conditionState` choice on the
  ladder.** Neither is candidate omission, evidence binding, validator, resolver or scorer.
* **Exposure is bounded on the already-open cohort**: qwen chooses `CONTROLLED` on **1 of 24**
  scenarios and `HYPOTHETICAL` on **1 of 24**; Gemini `0/24` and `1/24`.

---

## The programme decision this phase hands over — NOT EXECUTED

> ### IS THE RESIDUAL EVIDENCE NOW SUFFICIENT TO CHOOSE WHICH AUTHORIZED PROVIDER, IF ANY, MAY EXECUTE THE SINGLE-USE SEALED ACCEPTANCE RUN?

**Engineering's answer: NO — and the remaining gap is now small, named, and NOT a measurement gap.**

What the evidence supports and does not:

| input the decision must weigh | what L3-2k establishes |
|---|---|
| **`D-55`** | untouched. Its decisive axis (`CONDITIONAL_AND_ASSERTED`) is structural-only and this phase did not test it |
| **`D-62`** | untouched, and **sharpened**: the two-scenario delta is now root-caused rather than merely counted |
| **§31.2 / §10 privacy boundary** | **still unadjudicated, and now the binding gap.** A sealed run against a hosted provider sends novel field-realistic observation text to a third party. No measurement can settle this |
| **hosted customer-text egress** | unchanged. The local provider satisfies it absolutely at `127.0.0.1`; Gemini does not |
| **preview-model mutability** | unchanged. `gemini-3.1-pro-preview` has no content digest. §42.5's drift control covered one day only and has **re-armed** |
| **the 592-thought-token confound** | unchanged, and it cuts **in Gemini's favour** on both cases measured here |
| **instrument-dependent Gemini noise floor** | unchanged — 0/24 locked, 2/24 shipped-runner |
| **`F-WC-09` root cause** | provider-stage `ASSERTION_STATE_SELECTION`, deterministic, **1 of 24 exposure**, with a severe consequence (hazard deleted) |
| **`C-CS-05` root cause** | provider-stage state instability plus a prompt-position effect that **does not occur under the shipped configuration** |
| **the sealed corpus is spent once** | §29.8. It is the only unspent evidence the programme has |

**The smallest remaining evidence gap is NOT evidence.** Both residuals are root-caused; a third
diagnostic phase on already-open material would add precision to a two-scenario delta and would not
change the decision. What blocks the sealed run is a **policy adjudication of §31.2** — whether novel
customer-shaped observation text may leave `127.0.0.1` at all — and that belongs to the user.

**Recommendation, for the user to accept or reject:**

1. **Adjudicate §31.2 first.** If hosted egress of sealed-corpus observation text is refused, the
   sealed run must execute against `qwen3-coder:30b`, and `F-WC-09`'s deletion mechanism becomes a
   known, quantified, one-scenario cost carried into acceptance rather than an open question.
2. **If hosted egress is permitted**, the preview-label problem (`MUST_REVERIFY`) must be closed
   first — a single-use acceptance result that cannot be reproduced because its model moved under its
   label is not an acceptance result.
3. **Do not open the corpus to settle a provider question.** §29.8 spends it once.

## Is another diagnostic phase justified?

**No.** Both mechanisms are established with controls, at both tiers, on both providers. The honest
remaining engineering items are all pre-existing and none is on the sealed-run critical path.

### If the user nevertheless wants engineering work before the decision, the narrowest defensible slice

**Not a repair — a bounded architectural question, and it is a `§22` question, not a patch:**
*should a state the binder cannot support be **demoted** rather than **deleted**?* §35.1's asymmetry
governs (*a vocabulary used to REJECT must be unambiguous*), `D-57`'s precedent is that a refused
clarification is dropped and never fatal, and `F-WC-09` is the first measured case where a **correct**
refusal costs an entire high-consequence finding. That question requires its own root-cause and
hazard-deletion measurement and **must not be answered by editing the binder to make `F-WC-09` pass.**

### Do NOT

* repair either case — remediation was not authorized and no remediation terminal exists;
* make `control-adequacy.ts` decide anything (§36.4, `L3-INV-12`);
* edit the binder's refusal semantics to recover `F-WC-09`;
* read the rejected v7 `V_A_LADDER` row that produced an `ACTIVE` candidate as a reason to reopen
  `D-59` — that prompt was measured and refused on high-consequence grounds;
* promote variant A, promote `R1_MISSING_FIRST`, or promote the structural representation on the
  strength of two scenarios;
* tune the prompt, change schema key order, or reactivate `unresolvedDecisions`;
* consume the sealed acceptance corpus, begin L3-3, or select a production provider;
* deploy, commit, push, or perform any stash operation.

---

## Deferred, unchanged

1. `R1_MISSING_FIRST` still **not promoted**.
2. Unifying the two clarification shape predicates, with the hazard-deletion consequence measured.
3. `F-FLD-159`'s class; `DISC-02`.
4. Whether the structural representation is ever selected (§41 / §42 item).
5. **New:** the demote-versus-delete question above.

## Sealed corpus

`safescope-gauntlet.source.v1.json` (`a95e5480…`), `safescope-gauntlet.seed.json` (`49aa40fd…`) and
`safescope-field-realism-pack-v2.v1.json` (`6f6897f1…`) hash-verified unchanged before and after,
present in **zero** artifacts, seen by no provider.
