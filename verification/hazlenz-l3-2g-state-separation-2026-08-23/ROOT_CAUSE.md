# L3-2g — root causes, each established before any repair

`ROOT_CAUSE_BEFORE_REMEDIATION`. Three separate causes, three separate proofs, no shared harness
between the deterministic ones and the provider experiment.

---

## RC-1 — the binder residual is a REJECTION VOCABULARY problem, and it is ten tokens

**Proven pre-patch**, no inference involved (`rootcause/binder-residual-pre-patch.json`).

`checkContradiction` case (B) consulted the full `CORRECTION_TOKENS` list to **delete** an ACTIVE
candidate. §35.1's governing asymmetry says a vocabulary used to REJECT must be unambiguous. It was
not.

**The measured mechanism, on the sealed scenario:**

> "A DANGER OPEN PIT sign **is fixed** to the handrail post beside the inspection pit … and the pit
> is left open across the walkway."
>
> → `SEMANTIC_EVIDENCE_CONTRADICTS_STATE`: *cited evidence asserts 'fixed' as a predicate, which
> contradicts ACTIVE*

Role analysis cannot separate the readings: `is fixed` **is** an asserted, unnegated predicate. The
defect is *what* it is predicated of — the sign, not the pit.

**A detail that matters for the next phase.** The loss depends on how the provider quoted.
`checkContradiction` reads `citedText(h)` — the concatenated evidence spans — so a narrow quote of
the hazard clause never reaches the check at all. The narrow-quote fixture **survives** and only the
broad-quote fixture dies. An audit that quoted narrowly would have reported a clean bill of health
it had not earned, and the first version of this proof made exactly that mistake before it was
corrected.

**§36.11 named one token and asked for five to be audited. The audit found ten.** Each was measured
deleting a correct high-consequence ACTIVE:
`fixed` `reset` `applied` `addressed` `closed out` `restored` `destroyed` `replaced` `reinstalled`
`resolved`. Four were measured correctly rejecting and are untouched: `made good` `repaired`
`corrected` `rectified` `remediated` `scrapped` `discarded`.

**And the first repair was wrong.** Removing all ten broke two prior-phase gates that are *right*.
That failure is the finding: the audit had conflated **different sense** (a homograph or idiom —
`fixed` = attached, `destroyed` = the damage itself) with **same sense, different object**
(`replaced` still means "put right"; only what it attached to differs). Only the first kind leaves
the rejection half.

---

## RC-2 — the multi-hazard scorer had never executed

**Proven from the recorded L3-2f artifacts, before any code change.**

`build-l32f-holdout.ts:227` wrote `minimumCandidates: 2` on `F-MH-01`.
`score-l32f-reasoning.ts:98` read `r.expect.minCandidates`.
The expectation interface at lines 41–42 declared **both**, which is how the mismatch survived
review.

`decompositionScored` therefore never incremented, and every tier of
`results/holdout-score-1.json` reported `multiHazardWithinTolerance: "n/a"` — including inside
`byProvenance`. §36.5's multi-hazard claim rests entirely on the direct inspection recorded there.

**This is a scoring defect, and the repair belongs in the reader.** The holdout is frozen at sha256
`47f92dae…`, verified byte-identical; rewriting a frozen evaluation artifact to suit its scorer is
the inversion §13.1's KG-4C incident and `test-evidence-foundation.ts` both record. No production
reasoning was touched.

---

## RC-3 — §36.7's trade is a RANKING problem, and separation relocates it rather than removing it

**Proven by controlled ablation**, model / digest / temperature / seed / `num_ctx` / timeout / user
prompt / observation text / evidence held constant, representation varied.

### The noise floor came first

`V_S_STRUCT` vs a **byte-identical** repeat: **0 of 24 differing** at both tiers. Without this number
none of the following is readable — §36.7's own 97/97 reproducibility was measured on the old
single-enum contract and does not transfer to a schema carrying a new required object.

### The harness was validated behaviourally, not by text identity

L3-2f's variant A was never frozen (`prompt-variants-frozen.json` holds only `v2_l32b` and
`v3_l32c`), so it cannot be byte-reproduced. The reconstruction is asserted to be a **position
change and nothing else** — same character multiset, verified in the run record — and it reproduces
§36.7's trade direction on the clarification axis: `C-CS-05` loses its question under A and keeps it
under B.

### What the ablation established

| finding | evidence |
|---|---|
| the contract CAN express the distinction | control-reading **23/24** correct in isolation |
| separation FIXES the high-consequence axis | **12/12** under every variant and every resolver ordering; `F-WC-09` recovered where no ordering ever recovered it |
| separation does NOT remove order sensitivity | size-matched: ladder **1/24**, structural **3/24**, floor **0/24** |
| the residual is not a ranking artefact | **4–12%** of candidates contradict *themselves* — `framing: CONDITIONAL` with `hazardAsserted: true` on separated, non-competing questions |

### Where the ranking actually went

Question B was tested over **frozen facts**, so provider variance is zero by construction. The
resolver as first written was wrong and the ablation caught it: `R0_HAZARD_FIRST` resolved an
asserted hazard before consulting a missing decision-critical fact, dropping the clarifications on
`F-OA-01` and `F-OA-02` entirely. `R1_MISSING_FIRST` recovers them.

> **The ranking did not disappear. It moved** — out of prose that drifts when a paragraph is edited,
> into a fixed and testable order in auditable code. That makes §36.7's four phases of accidental
> drift impossible, and it is a real gain. It is not the same as eliminating the ranking, and this
> phase does not claim it was.

`R1` was selected against **known** cases and is tuned on diagnostic evidence. It is deliberately
**not** promoted into `state-facts.ts`.

### Why this does not convict the provider

The elimination is clean — a contract limit is ruled out with direct evidence — and the
self-contradiction evidence points directly at the model rather than at any ranking. But it rests on
**one model**: §31.1's finding still holds, no hosted-provider credential is resolvable on this
machine, and `qwen3-coder:30b` is the only model pulled. One model on 24 diagnostic scenarios does
not establish a capability limit for the class.

**That single missing measurement is the whole of the phase's residual uncertainty**, and it is
48 calls of an already-written, unchanged harness.
