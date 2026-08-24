# L3-2l — what is closed, and the programme decision that still stands

## Terminal

> ### `L3_2L_COMPLETE — SEMANTIC_STATE_REJECTION_DELETION_RETAINED`
> ### `CLASS A — DELETE REMAINS CORRECT`
> ### `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Blueprint **§44**. Decision log **`D-65`**, additive. `D-55` … `D-64` preserved. §29–§43 not
rewritten. HEAD `1feda622`. **Nothing was implemented and no inference of any kind was run.**

## Is L3-3 eligible?

**No, and this phase did not move that gate.** `L3-3 must not start until` the high-consequence gate
reaches **zero on FRESH SEALED evidence** with the clarification axis still at **100/100**. No sealed
evidence was opened. Family coverage remains 24 of 24.

---

## What L3-2l settled, so the next phase does not re-derive it

* **The question is answered structurally, not by `F-WC-09`.** `checkStateSupported`'s `required` map
  covers `CORRECTED`, `REMOVED_FROM_SERVICE`, `NEGATED`, `HYPOTHETICAL`, `CONTROLLED`. **`ACTIVE` is
  not in it**, and in **84 firings across 1,871 records in 34 artifacts** it has refused an `ACTIVE`
  candidate **zero** times.
* **Therefore delete-versus-demote is a NULL MOVE on every hard §29.8 gate.** Hazard detection, false
  `ACTIVE` and the high-consequence axis are all computed from `asserts = some candidate at ACTIVE`.
  A deleted candidate does not assert; a demoted one does not either.
* **Demotion does not recover `F-WC-09`.** This is the finding that decides the phase. The remedy
  §43.8 asked for does not fix the case that motivated it.
* **`F-WC-09` is one of FOUR high-consequence identities this code has deleted** — with `E-FLD-147`,
  `X-WC-02` and `F-WC-03`. Do not design or argue from `F-WC-09` alone again.
* **The 39 negative-control rows are the other pole, and on them the MODEL is right.** `D02`
  ("locked out with each worker's personal lock"), `B14`, `H-OF7`, `DEV-28`: correct state choices the
  binder's admission vocabulary cannot read. Deletion still yields the expected customer outcome
  because both states are non-asserting — a **`D-54` agreement**, right outcome, unrelated reason.
* **The authority line, and it generalises:** *a refusal may demote to an undecided state only where
  the refusal itself established that the decision is open.* §33.4's impression gate qualifies (it
  proves nothing was asserted and raises `SEMANTIC_CLARIFICATION_EXPECTED_NOT_SUPPLIED` in the same
  breath). `checkStateSupported` does not — it proves only that its vocabulary is absent.
* **`control-adequacy.ts` REMAINS RECORDING-ONLY.** It looked like a discriminator and was refused on
  three grounds: silent on 33 of 52 rows; `L3-INV-12` / §36.4 / §43.4 fix it as advisory; and it
  would recover zero high-consequence misses anyway. **Do not re-propose it.**
* **Deletion is retained, not exonerated.** On the four high-consequence identities the customer gets
  no hazard record at all. That loss is real, and it is **not repairable at the binder** — it
  originates at `D-63`'s provider-stage state choice.

### The measured counterfactual, so it is never re-derived

| | **A DELETE** `SHIPPED` | **B DEMOTE** | **C RE-DERIVE ACTIVE** | **D PRESERVE+REJECT** |
|---|---|---|---|---|
| high-consequence recovered | 0 | **0** | 7 | **0** |
| false `ACTIVE` introduced | 0 | 0 | **39** | 0 |
| negative-control candidates preserved | 0 | **39** | 39 | **39** |
| unnecessary clarifications introduced | 0 | **31** | 0 | **31** |

**B and D are strictly dominated by A. C is forbidden by `L3-INV-08` and `L3-INV-04`.**

---

## The programme decision this phase hands back — NOT EXECUTED, and unchanged

> ### IS THE EVIDENCE NOW SUFFICIENT TO CHOOSE WHICH AUTHORIZED PROVIDER, IF ANY, MAY EXECUTE THE SINGLE-USE SEALED ACCEPTANCE RUN?

**Engineering's answer is still NO, and the gap is still NOT a measurement gap.** §43.8 offered one
engineering slice before that decision — this phase — and it is now closed. **No further diagnostic
phase on already-open material is justified**; this one exhausted the delete-versus-demote question
over the whole open corpus and reached a structural answer.

What blocks the sealed run, unchanged:

| input | state after L3-2l |
|---|---|
| **§31.2 / §10 privacy boundary** | **still unadjudicated, and still the binding gap.** No measurement can settle it |
| **preview-model mutability** | unchanged. `gemini-3.1-pro-preview` has no content digest; §42.5's drift control has **re-armed** |
| **`D-55`, `D-62`** | untouched |
| **`D-63` / `F-WC-09`** | **sharpened.** Its deletion is now known to be *unrepairable downstream*, so it must be carried into acceptance as a quantified cost rather than deferred as a fixable defect |
| **§29.8 single-use rule** | unchanged. The corpus is spent once |

**Recommended order, for the user to accept or reject:**

1. **Adjudicate §31.2 first.** Whether novel customer-shaped observation text may leave `127.0.0.1`.
2. **If hosted egress is REFUSED** — the sealed run executes against `qwen3-coder:30b`, and
   `F-WC-09`'s deletion is carried into acceptance as a known one-scenario high-consequence cost,
   now with this phase's evidence that no downstream repair exists.
3. **If hosted egress is PERMITTED** — close the preview-label problem before spending the corpus.

> **Do not open the sealed corpus to settle a provider question.**
